import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Save, Lock, Plus, Trash2, Camera, Shield } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { updateProfile } from '../context/authSlice';
import { getImageUrl } from '../services/api';
import { getInitials, formatDate } from '../utils/helpers';

const Profile = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      addresses: user?.addresses?.length
        ? user.addresses
        : [{ label: 'Home', street: '', city: '', state: '', postalCode: '', country: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm();

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('addresses', JSON.stringify(data.addresses));
      if (avatarFile) formData.append('profileImage', avatarFile);

      const result = await dispatch(updateProfile(formData));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Profile updated successfully');
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        toast.error(result.payload || 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  };

  const onPasswordSubmit = async (data) => {
    const formData = new FormData();
    formData.append('password', data.password);
    const result = await dispatch(updateProfile(formData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Password updated successfully');
      resetPwd();
    } else {
      toast.error(result.payload || 'Password update failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 lg:px-8">
      <h1 className="mb-6 text-2xl font-extrabold text-slate-900 dark:text-white">My Profile</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Summary card */}
        <div className="card p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-primary-700 text-3xl font-bold text-white">
                {avatarPreview || user?.profileImage ? (
                  <img
                    src={avatarPreview || getImageUrl(user.profileImage)}
                    alt={user?.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user?.name)
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-white shadow-md hover:bg-primary-700">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>

            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary capitalize">
              <Shield size={12} />
              {user?.role}
            </span>

            <div className="mt-6 w-full border-t border-slate-100 dark:border-dark-border pt-4 text-left">
              <p className="text-xs font-medium uppercase text-slate-400">Member Since</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200">
                {formatDate(user?.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Forms */}
        <div className="space-y-6 lg:col-span-2">
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input className="input-field pl-10" {...register('name', { required: 'Name is required' })} />
                </div>
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label-text">Phone Number</label>
                <input className="input-field" placeholder="+1 234 567 8900" {...register('phone')} />
              </div>

              <div className="sm:col-span-2">
                <label className="label-text">Email Address</label>
                <input type="email" disabled value={user?.email} className="input-field opacity-60 cursor-not-allowed" />
                <p className="mt-1 text-xs text-slate-400">Email cannot be changed</p>
              </div>
            </div>

            {/* Addresses */}
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Shipping Addresses</h4>
                <button
                  type="button"
                  onClick={() => append({ label: 'Address', street: '', city: '', state: '', postalCode: '', country: '' })}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  <Plus size={14} /> Add Address
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="rounded-xl border border-slate-200 dark:border-dark-border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <input
                        className="input-field max-w-[180px] text-sm"
                        placeholder="Label (e.g. Home)"
                        {...register(`addresses.${index}.label`)}
                      />
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)} className="text-red-500 hover:text-red-600">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input className="input-field text-sm col-span-2" placeholder="Street Address" {...register(`addresses.${index}.street`)} />
                      <input className="input-field text-sm" placeholder="City" {...register(`addresses.${index}.city`)} />
                      <input className="input-field text-sm" placeholder="State" {...register(`addresses.${index}.state`)} />
                      <input className="input-field text-sm" placeholder="Postal Code" {...register(`addresses.${index}.postalCode`)} />
                      <input className="input-field text-sm" placeholder="Country" {...register(`addresses.${index}.country`)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="btn-primary mt-6">
              {saving ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Save size={16} /> Save Changes
                </>
              )}
            </button>
          </form>

          <form onSubmit={handlePwdSubmit(onPasswordSubmit)} className="card p-6">
            <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Change Password</h3>
            <div>
              <label className="label-text">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  className="input-field pl-10"
                  {...registerPwd('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Must be at least 6 characters' },
                  })}
                />
              </div>
              {pwdErrors.password && <p className="mt-1 text-xs text-red-500">{pwdErrors.password.message}</p>}
            </div>
            <button type="submit" className="btn-primary mt-4">
              <Lock size={16} /> Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
