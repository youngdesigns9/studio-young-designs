import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import {
  Loader2,
  Save,
  Plus,
  X,
  Award,
  Trash2,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const Route = createFileRoute("/admin/why")({
  component: WhyChooseUsComponent,
});

interface WhyItem {
  id: string;
  title: string;
  description: string;
  is_visible: boolean;
  display_order: number;
}

function WhyChooseUsComponent() {
  const [items, setItems] = useState<WhyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tableExists, setTableExists] = useState(true);

  // Section Info State (saved in site_config)
  const [heading, setHeading] = useState("");
  const [subtitle, setSubtitle] = useState("");

  // Form State for edit/add
  const [editingItem, setEditingItem] = useState<WhyItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch site_config headings
      const { data: configData } = await supabase
        .from("site_config")
        .select("key, value")
        .in("key", ["why_heading", "why_subtitle"]);

      if (configData) {
        const headingObj = configData.find((c) => c.key === "why_heading");
        const subtitleObj = configData.find((c) => c.key === "why_subtitle");
        setHeading(headingObj?.value || "Considered work, without compromise.");
        setSubtitle(
          subtitleObj?.value ||
            "We are a small studio by choice. It lets us stay close to the drawing, to the wood, to the client — and to the standards we set ourselves in 1981.",
        );
      }

      // 2. Fetch public.why_choose_us list
      const { data: listData, error } = await supabase
        .from("why_choose_us")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        setTableExists(false);
        setItems([]);
      } else {
        setTableExists(true);
        setItems(listData || []);
      }
    } catch (err) {
      setTableExists(false);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase.from("site_config").upsert(
        [
          { key: "why_heading", value: heading },
          { key: "why_subtitle", value: subtitle },
        ],
        { onConflict: "key" },
      );

      if (error) throw error;
      toast.success("Section titles saved successfully");
    } catch (err: any) {
      toast.error("Failed to save titles: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (item: WhyItem) => {
    setIsAddingNew(false);
    setEditingItem(item);
    setFormTitle(item.title);
    setFormDescription(item.description);
  };

  const startAdd = () => {
    setEditingItem(null);
    setIsAddingNew(true);
    setFormTitle("");
    setFormDescription("");
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      toast.error("Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from("why_choose_us")
          .update({
            title: formTitle,
            description: formDescription,
          })
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Item updated successfully");
      } else {
        const { error } = await supabase.from("why_choose_us").insert([
          {
            title: formTitle,
            description: formDescription,
            display_order: items.length,
            is_visible: true,
          },
        ]);

        if (error) throw error;
        toast.success("Reason added successfully!");
      }

      setEditingItem(null);
      setIsAddingNew(false);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to save item: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this reason?")) return;

    setSaving(true);
    try {
      const { error } = await supabase.from("why_choose_us").delete().eq("id", id);

      if (error) throw error;
      toast.success("Item deleted successfully");
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      toast.error("Failed to delete item: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisibility = async (item: WhyItem) => {
    try {
      const { error } = await supabase
        .from("why_choose_us")
        .update({ is_visible: !item.is_visible })
        .eq("id", item.id);

      if (error) throw error;
      toast.success(item.is_visible ? "Reason hidden from website." : "Reason visible on website.");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to toggle visibility");
    }
  };

  const populateDefaults = async () => {
    setSaving(true);
    try {
      const defaultItems = [
        {
          title: "40+ Years Experience",
          description: "A four-decade practice, refined project by project.",
          display_order: 0,
          is_visible: true,
        },
        {
          title: "Bespoke Designs",
          description: "Every space drawn from the ground up around how you live.",
          display_order: 1,
          is_visible: true,
        },
        {
          title: "Premium Materials",
          description: "Walnut, oak, natural stone, brass — sourced without compromise.",
          display_order: 2,
          is_visible: true,
        },
        {
          title: "Turnkey Execution",
          description: "One studio, from first sketch to final handover.",
          display_order: 3,
          is_visible: true,
        },
        {
          title: "Expert Craftsmanship",
          description: "In-house atelier with master carpenters and finishers.",
          display_order: 4,
          is_visible: true,
        },
        {
          title: "Personalized Design Process",
          description: "A slow, considered dialogue with each client.",
          display_order: 5,
          is_visible: true,
        },
      ];

      const { error } = await supabase.from("why_choose_us").insert(defaultItems);

      if (error) throw error;
      toast.success("Default reasons initialized successfully!");
      fetchData();
    } catch (err: any) {
      toast.error("Failed to populate defaults: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const moveItem = async (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const newItems = [...items];
    const targetIdx = direction === "up" ? index - 1 : index + 1;

    const temp = newItems[index].display_order;
    newItems[index].display_order = newItems[targetIdx].display_order;
    newItems[targetIdx].display_order = temp;

    setSaving(true);
    try {
      const { error } = await supabase.from("why_choose_us").upsert([
        { id: newItems[index].id, display_order: newItems[index].display_order },
        { id: newItems[targetIdx].id, display_order: newItems[targetIdx].display_order },
      ]);

      if (error) throw error;
      toast.success("Order updated successfully");
      fetchData();
    } catch (err) {
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#cb2026]" />
          <p className="font-display text-xs tracking-widest uppercase text-stone-400">
            Loading Section Configurations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-stone-850 dark:text-white">
      {/* Table Warning Notice */}
      {!tableExists && (
        <div className="flex flex-col sm:flex-row gap-4 items-start bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/50 p-5 rounded-xl shadow-sm text-stone-850 dark:text-stone-200">
          <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-stone-900 dark:text-white">
              Supabase Table Missing: public.why_choose_us
            </h4>
            <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
              The database table required for custom "Why Choose Us" cards has not been created yet.
              Please copy the SQL commands from the{" "}
              <code className="text-[#cb2026] bg-stone-50 dark:bg-stone-900 px-1.5 py-0.5 rounded font-mono">
                SUPABASE_WHY_CHOOSE_US.sql
              </code>{" "}
              file in your project folder, paste it into your Supabase project SQL Editor, and click
              "Run".
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-850 p-6 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-semibold text-stone-900 dark:text-white tracking-wide">
            Why Choose Us Manager
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Configure section titles, reasons, values, and visibility settings.
          </p>
        </div>
        <div className="flex gap-2">
          {items.length === 0 && tableExists && (
            <button
              onClick={populateDefaults}
              className="flex items-center gap-1.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 px-4 py-2.5 rounded text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-800 transition-all cursor-pointer"
            >
              <Sparkles size={14} className="text-[#cb2026]" />
              <span>Initialize Default Cards</span>
            </button>
          )}
          <button
            onClick={startAdd}
            disabled={!tableExists}
            className="flex items-center gap-1.5 bg-[#cb2026] text-white px-4 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-30 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Reason</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start pb-20">
        {/* SIDEBAR LIST & CONFIG */}
        <div className="lg:col-span-1 space-y-6">
          {/* Section Titles Config Form */}
          <form
            onSubmit={handleSaveConfig}
            className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-5 space-y-4 shadow-sm text-stone-900 dark:text-white"
          >
            <span className="text-[10px] uppercase tracking-widest text-[#cb2026] font-bold block">
              Section Copy
            </span>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                Section Heading
              </label>
              <input
                type="text"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-550 font-bold block">
                Section Paragraph (Subtitle)
              </label>
              <textarea
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                rows={3}
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none leading-relaxed"
                required
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 rounded py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? (
                <Loader2 size={12} className="animate-spin text-[#cb2026]" />
              ) : (
                <Save size={14} />
              )}
              <span>Save Titles</span>
            </button>
          </form>

          {/* List of reasons */}
          <div className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-4 space-y-2 shadow-sm">
            <span className="text-[10px] uppercase tracking-widest text-stone-450 dark:text-stone-500 font-bold block mb-2 px-2">
              Configured Reasons
            </span>

            {items.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => startEdit(item)}
                className={`w-full flex justify-between items-center text-left px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all border cursor-pointer ${
                  editingItem?.id === item.id && !isAddingNew
                    ? "bg-[#cb2026]/10 border-[#cb2026]/30 text-stone-950 dark:text-white font-bold"
                    : "bg-transparent border-transparent text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900/50 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                <div className="flex items-center gap-2 max-w-[55%]">
                  <Award
                    size={14}
                    className={
                      editingItem?.id === item.id && !isAddingNew
                        ? "text-[#cb2026]"
                        : "text-stone-400"
                    }
                  />
                  <span className="truncate">{item.title}</span>
                </div>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => moveItem(idx, "up")}
                    disabled={idx === 0}
                    className="p-1 text-stone-350 dark:text-stone-550 hover:text-[#cb2026] disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    onClick={() => moveItem(idx, "down")}
                    disabled={idx === items.length - 1}
                    className="p-1 text-stone-350 dark:text-stone-550 hover:text-[#cb2026] disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    onClick={() => toggleVisibility(item)}
                    className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
                    title={item.is_visible ? "Hide from website" : "Show on website"}
                  >
                    {item.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                </div>
              </div>
            ))}

            {items.length === 0 && tableExists && (
              <div className="py-8 text-center text-stone-400 dark:text-stone-600 text-xs border border-dashed border-stone-200 dark:border-stone-800 rounded-lg space-y-2">
                <p>No reasons found in database.</p>
                <button
                  onClick={populateDefaults}
                  className="text-[10px] uppercase font-bold text-[#cb2026] hover:underline"
                >
                  Populate defaults now
                </button>
              </div>
            )}

            {items.length === 0 && !tableExists && (
              <div className="py-8 text-center text-stone-450 dark:text-stone-550 text-xs border border-dashed border-red-200 dark:border-stone-800 rounded-lg">
                Setup database to manage reasons.
              </div>
            )}
          </div>
        </div>

        {/* REASON FORM WORKSPACE */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {isAddingNew || editingItem ? (
              <motion.form
                key={editingItem ? editingItem.id : "new-reason"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onSubmit={handleSaveItem}
                className="border border-stone-200 dark:border-stone-850 bg-white dark:bg-[#141416] rounded-xl p-6 space-y-6 shadow-sm text-stone-900 dark:text-white"
              >
                <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-4 mb-4">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-white">
                      {editingItem ? "Edit Reason" : "Add New Reason"}
                    </h3>
                    <p className="text-[10px] text-stone-400 dark:text-stone-505 uppercase tracking-widest mt-0.5 font-semibold">
                      {editingItem
                        ? `Editing Reason ID: #${editingItem.id}`
                        : "Configure new differentiator card"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNew(false);
                        setEditingItem(null);
                      }}
                      className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-850 dark:text-stone-200 px-4 py-2.5 rounded text-xs font-bold hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                    {editingItem && (
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(editingItem.id)}
                        className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-600 dark:hover:bg-red-900 text-red-650 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-900/50 px-3.5 py-2.5 rounded text-xs font-bold transition-all cursor-pointer"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-1.5 bg-[#cb2026] text-white px-5 py-2.5 rounded text-xs font-bold hover:bg-[#df383e] transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>Save Reason</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Reason Title / Headline
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 40+ Years Experience"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none font-semibold"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500 font-bold block">
                      Detailed description tagline
                    </label>
                    <textarea
                      placeholder="Brief explanatory sentence detail about this differentiator..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded p-3 text-xs text-stone-900 dark:text-white focus:border-[#cb2026] focus:bg-white dark:focus:bg-transparent outline-none leading-relaxed"
                      required
                    />
                  </div>
                </div>
              </motion.form>
            ) : (
              <div className="border border-dashed border-stone-200 dark:border-stone-850 p-8 rounded-xl text-center text-stone-400 dark:text-stone-600 text-xs py-20 font-display uppercase tracking-widest bg-white dark:bg-[#141416] shadow-sm">
                Select a reason from the sidebar list on the left to edit it, or click "Add New
                Reason" at the top to create one.
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
