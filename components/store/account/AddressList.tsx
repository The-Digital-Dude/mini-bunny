"use client"

import { useState, useEffect } from "react"
import { MapPin, Edit2, Trash2, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import AddressModal from "./AddressModal"

export default function AddressList() {
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [addressToEdit, setAddressToEdit] = useState<any | null>(null)

  const fetchAddresses = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/addresses")
      if (res.ok) {
        const data = await res.json()
        setAddresses(data.addresses || [])
      }
    } catch (error) {
      console.error("Failed to fetch addresses", error)
      toast.error("Failed to load addresses")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAddresses()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return

    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "DELETE"
      })
      if (res.ok) {
        toast.success("Address deleted")
        fetchAddresses()
      } else {
        toast.error("Failed to delete address")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true })
      })
      if (res.ok) {
        toast.success("Default address updated")
        fetchAddresses()
      } else {
        toast.error("Failed to update default address")
      }
    } catch (error) {
      toast.error("An error occurred")
    }
  }

  const handleEdit = (address: any) => {
    setAddressToEdit(address)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setAddressToEdit(null)
    setIsModalOpen(true)
  }

  const onModalSaved = () => {
    setIsModalOpen(false)
    toast.success(addressToEdit ? "Address updated successfully" : "Address added successfully")
    fetchAddresses()
  }

  if (loading) {
    return (
      <div className="py-16 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-bunny-blue" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-bunny-navy">Saved Addresses</h2>
        <button 
          onClick={handleAddNew}
          className="bg-bunny-navy text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-bunny-blue transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-bunny-border rounded-2xl bg-bunny-muted/30">
          <MapPin className="w-12 h-12 mx-auto text-bunny-border mb-4" />
          <p className="text-bunny-text-muted">No saved addresses yet.</p>
          <button onClick={handleAddNew} className="mt-4 text-bunny-blue text-sm font-bold uppercase tracking-widest hover:underline">
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div 
              key={address.id} 
              className={`relative border rounded-2xl p-6 transition-all ${
                address.isDefault ? 'border-bunny-blue bg-bunny-blue/5 shadow-sm' : 'border-bunny-border bg-white hover:border-bunny-navy'
              }`}
            >
              {address.isDefault && (
                <span className="absolute top-4 right-4 bg-bunny-blue text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  Default
                </span>
              )}

              <div className="flex items-center gap-2 mb-4">
                <MapPin className={`w-5 h-5 ${address.isDefault ? 'text-bunny-blue' : 'text-bunny-text-muted'}`} />
                <h3 className="font-bold text-bunny-navy">{address.label}</h3>
              </div>

              <div className="space-y-1 text-sm text-bunny-text mb-6">
                <p className="font-medium text-bunny-navy">{address.fullName}</p>
                <p>{address.phone}</p>
                <p className="pt-2">{address.address}</p>
                <p>{address.area}, {address.district}</p>
                <p>{address.division}</p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-bunny-border">
                <button 
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-bunny-text-muted hover:text-bunny-navy transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-bunny-error/70 hover:text-bunny-error transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
                
                {!address.isDefault && (
                  <button 
                    onClick={() => handleSetDefault(address.id)}
                    className="ml-auto text-xs font-bold uppercase tracking-widest text-bunny-blue hover:underline"
                  >
                    Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={onModalSaved}
        addressToEdit={addressToEdit}
      />
    </div>
  )
}
