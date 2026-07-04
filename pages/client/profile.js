import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency, getInitials } from '@/lib/helpers'
import { User } from 'lucide-react'

export default function ClientProfile({ user }) {
  const [profile, setProfile] = useState(user)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const uploadAvatar = async () => {
    if (!file) return
    setUploading(true)
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_image_url: urlData.publicUrl })
      .eq('id', user.id)

    if (updateError) {
      alert('Update failed: ' + updateError.message)
    } else {
      setProfile({ ...profile, profile_image_url: urlData.publicUrl })
      // Refresh user in layout – you can also trigger a global update
    }
    setUploading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Profile</h1>
        <p className="text-gray-500">Manage your account details</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-lg">
        <div className="flex flex-col items-center gap-4 mb-6">
          <img
            src={profile?.profile_image_url || `https://ui-avatars.com/api/?name=${profile?.name}&background=6366f1&color=fff&size=128`}
            alt="Profile"
            className="w-28 h-28 rounded-full border-4 border-indigo-100 object-cover"
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
            />
            {file && (
              <button
                onClick={uploadAvatar}
                disabled={uploading}
                className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-1.5 px-4 rounded-lg transition disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        </div>
        <div className="space-y-3">
          <div><p className="text-sm text-gray-500">Name</p><p className="font-medium text-gray-800">{profile?.name}</p></div>
          <div><p className="text-sm text-gray-500">Email</p><p className="font-medium text-gray-800">{profile?.email}</p></div>
          <div><p className="text-sm text-gray-500">Role</p><p className="font-medium text-gray-800 capitalize">{profile?.role}</p></div>
          <div><p className="text-sm text-gray-500">Balance</p><p className="font-bold text-2xl text-gray-800">{formatCurrency(profile?.balance || 0)}</p></div>
        </div>
      </div>
    </div>
  )
}