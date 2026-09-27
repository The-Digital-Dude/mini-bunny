"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Tag, Pencil, Trash2, Ruler, X, CornerDownRight, FolderPlus, Layers } from "lucide-react"
import Image from "next/image"
import ImagePicker from "@/components/admin/ImagePicker"

type Category = {
  id: string
  name: string
  slug: string
  description: string
  image: string
  parentId: string | null
  parentName: string | null
  children?: { id: string; name: string; slug: string }[]
  isActive: boolean
  showOnNavbar: boolean
  showOnHomepage: boolean
  sortOrder: number
  productCount: number
}

const emptyForm = (parentId: string | null = null) => ({
  name: "",
  slug: "",
  description: "",
  image: "",
  parentId: parentId,
  isActive: true,
  showOnNavbar: true,
  showOnHomepage: true,
  sortOrder: 0,
})

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

const DEFAULT_COLUMNS = ["Size", "Age", "Weight (kg)", "Length (cm)", "Chest (cm)"]

function emptySizeGuide() {
  return {
    unit: "cm",
    columns: DEFAULT_COLUMNS,
    rows: [
      ["0-3M", "0-3 Months", "3-5.5", "55-61", "40"],
      ["3-6M", "3-6 Months", "5.5-7.5", "61-67", "43"],
      ["6-12M", "6-12 Months", "7.5-9.5", "67-76", "46"],
      ["12-18M", "12-18 Months", "9.5-11.5", "76-83", "49"],
      ["1-3Y", "1-3 Years", "11.5-15", "83-98", "54"],
    ],
    notes: "",
  }
}

function SizeGuideEditor({ categoryId, onClose }: { categoryId: string; onClose: () => void }) {
  const [guide, setGuide] = useState(emptySizeGuide())
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/size-guide?categoryId=${categoryId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.columns) {
          setGuide({
            unit: d.unit || "cm",
            columns: JSON.parse(d.columns),
            rows: JSON.parse(d.rows),
            notes: d.notes || "",
          })
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [categoryId])

  const updateCell = (ri: number, ci: number, val: string) => {
    setGuide((g) => {
      const rows = g.rows.map((r, i) => (i === ri ? r.map((c, j) => (j === ci ? val : c)) : r))
      return { ...g, rows }
    })
  }

  const addRow = () => setGuide((g) => ({ ...g, rows: [...g.rows, g.columns.map(() => "")] }))
  const removeRow = (i: number) => setGuide((g) => ({ ...g, rows: g.rows.filter((_, ri) => ri !== i) }))

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/size-guide", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          unit: guide.unit,
          columns: JSON.stringify(guide.columns),
          rows: JSON.stringify(guide.rows),
          notes: guide.notes || null,
        }),
      })
      if (res.ok) {
        toast.success("Size guide saved")
        onClose()
      } else {
        toast.error("Failed to save size guide")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Unit</label>
        <select
          value={guide.unit}
          onChange={(e) => setGuide((g) => ({ ...g, unit: e.target.value }))}
          className="border border-input rounded-md px-2 py-1 text-sm bg-white"
        >
          <option value="cm">cm & kg</option>
          <option value="inches">inches & lbs</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              {guide.columns.map((col, ci) => (
                <th key={ci} className="border border-gray-200 px-2.5 py-1.5 text-left text-xs font-bold bg-gray-50 text-gray-700">
                  {col}
                </th>
              ))}
              <th className="border border-gray-200 px-2 py-1.5 w-8" />
            </tr>
          </thead>
          <tbody>
            {guide.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-gray-200 p-0">
                    <input
                      value={cell}
                      onChange={(e) => updateCell(ri, ci, e.target.value)}
                      placeholder={ci === 0 ? "0-3M" : "e.g. 55-61"}
                      className="w-full px-2.5 py-1.5 text-xs focus:outline-none focus:bg-sky-50 min-w-[70px]"
                    />
                  </td>
                ))}
                <td className="border border-gray-200 px-1 text-center">
                  <button onClick={() => removeRow(ri)} className="text-gray-400 hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Button variant="outline" size="sm" onClick={addRow} className="gap-1 text-xs">
        <Plus className="w-3.5 h-3.5" /> Add Size Row
      </Button>

      <div>
        <label className="text-xs font-medium text-gray-700">Parent Notes / Care Guidance</label>
        <Input
          value={guide.notes}
          onChange={(e) => setGuide((g) => ({ ...g, notes: e.target.value }))}
          placeholder="e.g. If between sizes, choose the larger size for growth room."
          className="mt-1 text-xs"
        />
      </div>

      <Button onClick={save} disabled={saving} className="w-full bg-[#4A8DB7] hover:bg-[#3d7a9f] text-white">
        {saving ? "Saving..." : "Save Size Guide"}
      </Button>
    </div>
  )
}

export function CategoryClient({ data }: { data: Category[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [sizeGuideId, setSizeGuideId] = useState<string | null>(null)

  // Top-level parent categories available as parent choices
  const parentOptions = data.filter((c) => !c.parentId && c.id !== editingId)

  function openAdd(parentId: string | null = null) {
    setEditingId(null)
    setForm(emptyForm(parentId))
    setError("")
    setOpen(true)
  }

  function openEdit(c: Category) {
    setEditingId(c.id)
    setForm({
      name: c.name,
      slug: c.slug,
      description: c.description || "",
      image: c.image || "",
      parentId: c.parentId || null,
      isActive: c.isActive,
      showOnNavbar: c.showOnNavbar,
      showOnHomepage: c.showOnHomepage,
      sortOrder: c.sortOrder,
    })
    setError("")
    setOpen(true)
  }

  function onNameChange(name: string) {
    setForm((f) => ({ ...f, name, slug: editingId ? f.slug : slugify(name) }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and Slug are required.")
      return
    }
    setSaving(true)
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : "/api/admin/categories"
      const res = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        toast.success(editingId ? "Category updated" : "Category created")
        setOpen(false)
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to save")
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? If it has subcategories or products, please verify first.")) return
    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Category deleted")
        router.refresh()
      } else {
        const d = await res.json()
        toast.error(d.error || "Failed to delete")
      }
    } finally {
      setDeleting(null)
    }
  }

  async function toggleField(id: string, field: "isActive" | "showOnNavbar" | "showOnHomepage", value: boolean) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    })
    if (res.ok) router.refresh()
    else toast.error("Failed to update")
  }

  // Organize categories into hierarchical tree list
  const topLevelCategories = data.filter((c) => !c.parentId)
  const childCategories = data.filter((c) => !!c.parentId)

  const treeRows: { category: Category; isChild: boolean }[] = []
  topLevelCategories.forEach((parent) => {
    treeRows.push({ category: parent, isChild: false })
    const children = childCategories.filter((child) => child.parentId === parent.id)
    children.forEach((child) => {
      treeRows.push({ category: child, isChild: true })
    })
  })

  // Add any orphaned children (if parent was deleted or not top-level)
  childCategories
    .filter((c) => !topLevelCategories.some((p) => p.id === c.parentId))
    .forEach((orphan) => {
      treeRows.push({ category: orphan, isChild: true })
    })

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200">
        <div>
          <span className="text-xs font-bold text-[#4A8DB7] uppercase tracking-wider">Hierarchy & Organization</span>
          <p className="text-xs text-gray-500 mt-0.5">
            Create main categories and nest subcategories under them for clean navigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => openAdd(null)} className="gap-1.5 bg-[#4A8DB7] hover:bg-[#3d7a9f] text-white rounded-xl shadow-xs">
            <Plus className="h-4 w-4" /> Add Main Category
          </Button>
        </div>
      </div>

      {/* Size Guide Dialog */}
      <Dialog open={!!sizeGuideId} onOpenChange={(v) => !v && setSizeGuideId(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-[#4A8DB7]" /> Baby Sizing & Measurements Editor
            </DialogTitle>
          </DialogHeader>
          {sizeGuideId && <SizeGuideEditor categoryId={sizeGuideId} onClose={() => setSizeGuideId(null)} />}
        </DialogContent>
      </Dialog>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-[#4A8DB7]" /> {editingId ? "Edit Category" : form.parentId ? "New Subcategory" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            {/* Parent Category Selection */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Parent Category (Optional)</label>
              <select
                value={form.parentId || ""}
                onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value || null }))}
                className="w-full mt-1.5 h-10 px-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4A8DB7]"
              >
                <option value="">None (Top-Level Parent Category)</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    📁 {p.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-gray-400 mt-1">
                Select a parent if this is a subcategory (e.g. "Kimono Rompers" under "Rompers & Onesies").
              </p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Name *</label>
              <Input
                value={form.name}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="e.g. Rompers & Onesies or Newborn Knots"
                required
                className={`mt-1.5 rounded-xl ${error && !form.name.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Slug (URL Path) *</label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="rompers-onesies"
                required
                className={`mt-1.5 rounded-xl ${error && !form.slug.trim() ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              <p className="text-[11px] text-gray-400 mt-1">Shop link: /shop?category={form.slug || "slug"}</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Description</label>
              <Input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional short description for parent guide"
                className="mt-1.5 rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Category Cover Photo</label>
              <div className="mt-1.5">
                <ImagePicker value={form.image} onChange={(url) => setForm((f) => ({ ...f, image: url }))} bucket="category-images" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Sort Order</label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                className="mt-1.5 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex flex-col items-start gap-1.5">
                <label className="text-[11px] font-semibold text-gray-700">Active</label>
                <Switch checked={form.isActive} onCheckedChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <label className="text-[11px] font-semibold text-gray-700">Show on Navbar</label>
                <Switch checked={form.showOnNavbar} onCheckedChange={(v) => setForm((f) => ({ ...f, showOnNavbar: v }))} />
              </div>
              <div className="flex flex-col items-start gap-1.5">
                <label className="text-[11px] font-semibold text-gray-700">Show on Home</label>
                <Switch checked={form.showOnHomepage} onCheckedChange={(v) => setForm((f) => ({ ...f, showOnHomepage: v }))} />
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#4A8DB7] hover:bg-[#3d7a9f] text-white rounded-xl" disabled={saving}>
              {saving ? "Saving..." : editingId ? "Save Changes" : form.parentId ? "Create Subcategory" : "Create Main Category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-gray-50/80 text-xs font-semibold uppercase text-gray-500">
            <TableRow>
              <TableHead className="py-3.5 px-4">Category & Subcategories</TableHead>
              <TableHead className="py-3.5">Cover Image</TableHead>
              <TableHead className="py-3.5">Products</TableHead>
              <TableHead className="py-3.5">Active</TableHead>
              <TableHead className="py-3.5">Navbar</TableHead>
              <TableHead className="py-3.5">Homepage</TableHead>
              <TableHead className="py-3.5 text-right px-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {treeRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-400 py-12 text-sm">
                  No categories yet — click "Add Main Category" to create your first baby boutique category.
                </TableCell>
              </TableRow>
            )}
            {treeRows.map(({ category: c, isChild }) => (
              <TableRow key={c.id} className={isChild ? "bg-sky-50/20 hover:bg-sky-50/40" : "hover:bg-gray-50/50"}>
                <TableCell className="py-3.5 px-4">
                  <div className={`flex items-center gap-2 ${isChild ? "pl-6" : ""}`}>
                    {isChild ? (
                      <CornerDownRight className="w-4 h-4 text-[#4A8DB7] shrink-0" />
                    ) : (
                      <Layers className="w-4 h-4 text-gray-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isChild ? "text-gray-800" : "text-gray-900"}`}>{c.name}</span>
                        {isChild ? (
                          <span className="text-[10px] font-medium bg-sky-100 text-[#2B5B7D] px-2 py-0.5 rounded-full">
                            Sub of {c.parentName || "Parent"}
                          </span>
                        ) : c.children && c.children.length > 0 ? (
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {c.children.length} subcategories
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-gray-400 font-mono">/shop?category={c.slug}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  {c.image ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-gray-100 shadow-xs">
                      <Image src={c.image} alt={c.name} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 text-xs bg-gray-50">
                      {c.name.charAt(0)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-3.5">
                  <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
                    {c.productCount}
                  </span>
                </TableCell>
                <TableCell className="py-3.5">
                  <Switch checked={c.isActive} onCheckedChange={(v) => toggleField(c.id, "isActive", v)} />
                </TableCell>
                <TableCell className="py-3.5">
                  <Switch checked={c.showOnNavbar} onCheckedChange={(v) => toggleField(c.id, "showOnNavbar", v)} />
                </TableCell>
                <TableCell className="py-3.5">
                  <Switch checked={c.showOnHomepage} onCheckedChange={(v) => toggleField(c.id, "showOnHomepage", v)} />
                </TableCell>
                <TableCell className="py-3.5 text-right px-4">
                  <div className="flex items-center justify-end gap-1.5">
                    {!isChild && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openAdd(c.id)}
                        title="Add subcategory under this category"
                        className="h-8 text-xs font-semibold text-[#4A8DB7] border-sky-200 hover:bg-sky-50 gap-1 rounded-lg"
                      >
                        <FolderPlus className="h-3.5 w-3.5" /> + Sub
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => setSizeGuideId(c.id)} title="Edit Size Guide" className="h-8 w-8 p-0 rounded-lg">
                      <Ruler className="h-3.5 w-3.5 text-gray-600" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEdit(c)} title="Edit" className="h-8 w-8 p-0 rounded-lg">
                      <Pencil className="h-3.5 w-3.5 text-gray-600" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={deleting === c.id}
                      onClick={() => handleDelete(c.id)}
                      title="Delete"
                      className="h-8 w-8 p-0 rounded-lg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
