import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { format } from 'date-fns';
import { getUserData, updatePersonalInfo, updatePassword, updatePreferences } from '../services/api';
import React from 'react';
import { useNavigate } from 'react-router-dom';


// Type definitions
interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: Date;
  password?: string;
  profileImage: string | null;
  preferences: string[];
}

interface FormInputs {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  preferences: string[];
}

interface PasswordChangeInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const availablePreferences = [
  'Entertainment',
  'Sports',
  'Technology',
  'Science',
  'Politics',
  'Business',
  'Health',
  'Travel',
  'Food',
  'Fashion'
];

const Settings = () => {
  // State
  const [activeTab, setActiveTab] = useState<'personal' | 'password' | 'preferences'>('personal');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formSubmitting, setFormSubmitting] = useState<boolean>(false);
  const navigate = useNavigate();
  const [imageUploading, setImageUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Forms setup
  const [personalForm, setPersonalForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferencesForm, setPreferencesForm] = useState({
    preferences: [] as string[]
  });
  
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserData();
        setUserData(data);
        setPersonalForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          dob: format(new Date(data.dob), 'yyyy-MM-dd')
        });
        setPreferencesForm({
          preferences: data.preferences
        });
      } catch (error: any) {
        setErrorMessage(error.response?.data?.error || 'Failed to load user data');
        setTimeout(() => setErrorMessage(''), 3000);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  // Image handling functions
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('Image size must be less than 2MB');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Please select a valid image file (JPEG, PNG, or GIF)');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }
      
      setSelectedImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  

  // Form handlers
  const handlePersonalChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  const handlePreferencesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setPreferencesForm(prev => {
      if (checked) {
        return { preferences: [...prev.preferences, value] };
      } else {
        return { preferences: prev.preferences.filter(pref => pref !== value) };
      }
    });
  };

  // Form validation
  const validatePersonalForm = () => {
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: ''
    };
    
    if (!personalForm.firstName) errors.firstName = 'First name is required';
    if (!personalForm.lastName) errors.lastName = 'Last name is required';
    
    if (!personalForm.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(personalForm.email)) {
      errors.email = 'Invalid email address';
    }
    
    if (!personalForm.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(personalForm.phone)) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    if (!personalForm.dob) errors.dob = 'Date of birth is required';
    
    setFormErrors(prev => ({ ...prev, ...errors }));
    
    return !Object.values(errors).some(error => error);
  };
  
  const validatePasswordForm = () => {
    const errors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    
    if (!passwordForm.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(prev => ({ ...prev, ...errors }));
    
    return !Object.values(errors).some(error => error);
  };

  // Form submission handlers
  const handlePersonalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validatePersonalForm()) return;
    
    try {
      setFormSubmitting(true);
      
      const formData = new FormData();
      
      // Append personal info fields
      formData.append('firstName', personalForm.firstName);
      formData.append('lastName', personalForm.lastName);
      formData.append('email', personalForm.email);
      formData.append('phone', personalForm.phone);
      formData.append('dob', personalForm.dob);
      
      // Append image if selected
      if (selectedImage) {
        formData.append('profileImage', selectedImage);
      }
  
      const updatedUser = await updatePersonalInfo({
        firstName: personalForm.firstName,
        lastName: personalForm.lastName,
        email: personalForm.email,
        phone: personalForm.phone,
        dob: personalForm.dob,
        profileImage: selectedImage || undefined
      });
      
      // Update user data and reset states
      setUserData(updatedUser);
      setSuccessMessage('Profile updated successfully');
      setSelectedImage(null);
      setImagePreview(null);
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.message || 'Failed to update profile');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setFormSubmitting(false);
    }
  };
  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      setFormSubmitting(true);
      await updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      // This will now properly catch the "Current password is incorrect" message
      const errorMsg = error.response?.data?.message || 
                      error.message || 
                      'Failed to update password';
      setErrorMessage(errorMsg);
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setFormSubmitting(false);
    }
  };
  
  const handlePreferencesSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      setFormSubmitting(true);
      const updatedUser = await updatePreferences({
        preferences: preferencesForm.preferences
      });
      
      setUserData(updatedUser);
      setSuccessMessage('Preferences updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || 'Failed to update preferences');
      setTimeout(() => setErrorMessage(''), 3000);
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-white">
      <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
  <div className="flex items-center gap-4 border-b border-red-600 pb-2">
    {/* Back Button with underline effect */}
    <button
      onClick={() => navigate(-1)}
      className="flex items-center text-gray-800 hover:text-gray-600 transition-colors pb-2" // Added pb-2 to match heading
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
    </button>

    {/* Page Title */}
    <h1 className="text-3xl font-bold text-red-600 flex-grow">
      Account Settings
    </h1>
  </div>
</div>        
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="bg-gray-200 border border-green-500 text-green-500 px-4 py-3 rounded mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="bg-gray-200 border border-red-600 text-red-600 px-4 py-3 rounded mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {errorMessage}
          </div>
        )}
        
        {/* Navigation Tabs */}
        <div className="flex mb-6 border-b border-gray-800">
          <button 
            className={`py-3 px-6 mr-1 font-medium transition-colors duration-200 ${
              activeTab === 'personal' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setActiveTab('personal')}
          >
            Personal Information
          </button>
          <button 
            className={`py-3 px-6 mr-1 font-medium transition-colors duration-200 ${
              activeTab === 'password' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
          <button 
            className={`py-3 px-6 mr-1 font-medium transition-colors duration-200 ${
              activeTab === 'preferences' 
                ? 'border-b-2 border-red-600 text-red-600' 
                : 'text-gray-500 hover:text-black'
            }`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-6 shadow-lg">
          {/* Personal Information Form */}
          {activeTab === 'personal' && (
            <form onSubmit={handlePersonalSubmit} className="space-y-6">
<div className="flex items-center space-x-6">
  <div className="shrink-0">
    {imagePreview || userData?.profileImage ? (
      <img 
        className="h-20 w-20 object-cover rounded-full border-2 border-gray-300"
        src={imagePreview || userData?.profileImage} 
        alt="" // Empty alt text to ensure nothing shows
      />
    ) : (
      <div 
        className="h-20 w-20 flex items-center justify-center rounded-full border-2 border-gray-300 bg-gray-400 text-white text-2xl font-bold"
      >
        {(userData?.firstName?.charAt(0) || userData?.lastName?.charAt(0) || 'U').toUpperCase()}
      </div>
    )}
  </div>
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-900">
          Change profile photo
        </label>
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer">
            <span className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md text-sm font-medium transition-colors">
              Select Image
            </span>
            <input 
              type="file" 
              className="hidden"
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>
      </div>
    </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">First Name</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={personalForm.firstName}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                    placeholder="Enter your first name"
                  />
                  {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Last Name</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={personalForm.lastName}
                    onChange={handlePersonalChange}
                    className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                    placeholder="Enter your last name"
                  />
                  {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                <input 
                  type="email" 
                  name="email"
                  value={personalForm.email}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                  placeholder="Enter your email address"
                />
                {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={personalForm.phone}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                  placeholder="Enter your 10-digit phone number"
                />
                {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  name="dob"
                  value={personalForm.dob}
                  onChange={handlePersonalChange}
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                />
                {formErrors.dob && <p className="text-red-500 text-sm mt-1">{formErrors.dob}</p>}
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 flex items-center"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : "Update Personal Information"}
                </button>
              </div>
            </form>
          )}
          
          {/* Password Change Form */}
          {activeTab === 'password' && (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Current Password</label>
                <input 
                  type="password" 
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                  placeholder="Enter your current password"
                />
                {formErrors.currentPassword && <p className="text-red-500 text-sm mt-1">{formErrors.currentPassword}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">New Password</label>
                <input 
                  type="password" 
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                  placeholder="Enter your new password (min. 8 characters)"
                />
                {formErrors.newPassword && <p className="text-red-500 text-sm mt-1">{formErrors.newPassword}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 bg-gray-200 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 text-black"
                  placeholder="Confirm your new password"
                />
                {formErrors.confirmPassword && <p className="text-red-500 text-sm mt-1">{formErrors.confirmPassword}</p>}
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 flex items-center"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : "Update Password"}
                </button>
              </div>
            </form>
          )}
          
          {/* Preferences Form */}
          {activeTab === 'preferences' && (
            <form onSubmit={handlePreferencesSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium text-black mb-4">Select Your Preferences</label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePreferences.map((pref) => (
                    <div key={pref} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`pref-${pref}`}
                        value={pref}
                        checked={preferencesForm.preferences.includes(pref)}
                        onChange={handlePreferencesChange}
                        className="h-5 w-5 text-red-600 focus:ring-red-500 border-gray-700 rounded bg-black"
                      />
                      <label htmlFor={`pref-${pref}`} className="ml-3 block text-sm text-gray-900">
                        {pref}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 flex items-center"
                >
                  {formSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : "Update Preferences"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;