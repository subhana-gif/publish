import React, { useState } from 'react';
import { UserPlus, ArrowRight, Image, Check, X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

const preferencesList = ['Technology', 'Health', 'Politics', 'Sports', 'Entertainment'];

const MultiStepRegister = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
    profileImage: null,
    preferences: [],
  });
  const [errors, setErrors] = useState({});
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const navigate = useNavigate();

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = 'Email is invalid';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!form.dob) newErrors.dob = 'Date of birth is required';
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setForm({ ...form, profileImage: file });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateInitialAvatar = () => {
    if (!form.email) return null;
    const initial = form.email.charAt(0).toUpperCase();
    return (
      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-red-600 text-white text-4xl font-bold">
        {initial}
      </div>
    );
  };

  const removeImage = () => {
    setForm({ ...form, profileImage: null });
    setProfileImagePreview(null);
  };

  const togglePreference = (preference) => {
    setForm((prevForm) => {
      const updated = prevForm.preferences.includes(preference)
        ? prevForm.preferences.filter((pref) => pref !== preference)
        : [...prevForm.preferences, preference];
      return { ...prevForm, preferences: updated };
    });
  };

  const nextStep = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(step + 1);
      }
    } else {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('email', form.email);
    formData.append('phone', form.phone);
    formData.append('dob', form.dob);
    formData.append('password', form.password);
    formData.append('confirmPassword', form.confirmPassword);
    if (form.profileImage) {
      formData.append('profileImage', form.profileImage);
    }
    formData.append('preferences', JSON.stringify(form.preferences));
  
    try {
      const result = await registerUser(formData); // ✅ Now valid
      console.log('Registration successful', result);
      setRegistrationComplete(true);
    } catch (err) {
      console.error('Registration error:', err.message);
    }
  };
  
  // If registration is complete, show success message
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <Check size={64} className="mx-auto text-green-500" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Registration Complete!</h1>
          <p className="mt-2 text-gray-600">
            Thank you for registering. You can now login to your account.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-6 px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Personal Information</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input 
                  name="firstName" 
                  type="text" 
                  placeholder="First Name *" 
                  value={form.firstName} 
                  onChange={handleChange} 
                  className={`w-full p-3 border ${errors.firstName ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
                />
                {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
              </div>
              <div>
                <input 
                  name="lastName" 
                  type="text" 
                  placeholder="Last Name *" 
                  value={form.lastName} 
                  onChange={handleChange} 
                  className={`w-full p-3 border ${errors.lastName ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
                />
                {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>
            
            <div>
              <input 
                name="email" 
                type="email" 
                placeholder="Email *" 
                value={form.email} 
                onChange={handleChange} 
                className={`w-full p-3 border ${errors.email ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
              />
              {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div>
              <input 
                name="phone" 
                type="text" 
                placeholder="Phone Number *" 
                value={form.phone} 
                onChange={handleChange} 
                className={`w-full p-3 border ${errors.phone ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>
            
            <div>
              <input 
                name="dob" 
                type="date" 
                placeholder="Date of Birth *" 
                value={form.dob} 
                onChange={handleChange} 
                className={`w-full p-3 border ${errors.dob ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
            </div>
            
            <div>
              <input 
                name="password" 
                type="password" 
                placeholder="Password *" 
                value={form.password} 
                onChange={handleChange} 
                className={`w-full p-3 border ${errors.password ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
              />
              {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div>
              <input 
                name="confirmPassword" 
                type="password" 
                placeholder="Confirm Password *" 
                value={form.confirmPassword} 
                onChange={handleChange} 
                className={`w-full p-3 border ${errors.confirmPassword ? 'border-red-600' : 'border-gray-300'} rounded-md bg-white`} 
              />
              {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={nextStep} 
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Next <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Profile Picture (Optional)</h2>
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300 flex items-center justify-center bg-gray-100">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                ) : (
                  generateInitialAvatar() || <Image className="text-gray-400" size={48} />
                )}
              </div>
              
              {profileImagePreview && (
                <button 
                  onClick={removeImage}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <X size={16} className="mr-1" /> Remove image
                </button>
              )}
              
              <div className="w-full max-w-xs">
                <label className="block w-full px-4 py-2 text-center border border-gray-300 rounded-md cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                  <span className="text-gray-700">Choose a profile picture</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange} 
                  />
                </label>
              </div>
              
              <p className="text-sm text-gray-500">
                You can skip this step. If no image is uploaded, we'll use your email's first letter as avatar.
              </p>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={nextStep} 
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Next <ArrowRight className="ml-2" size={16} />
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Article Preferences (Optional)</h2>
            
            <div className="space-y-3">
              <p className="text-gray-600 mb-4">Select topics you're interested in:</p>
              
              {preferencesList.map((pref) => (
                <div 
                  key={pref} 
                  onClick={() => togglePreference(pref)}
                  className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${
                    form.preferences.includes(pref) 
                      ? 'border-red-600 bg-red-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center mr-3 ${
                    form.preferences.includes(pref) ? 'bg-red-600' : 'border border-gray-400'
                  }`}>
                    {form.preferences.includes(pref) && <Check size={14} className="text-white" />}
                  </div>
                  <span className="text-gray-900">{pref}</span>
                </div>
              ))}
              
              <p className="text-sm text-gray-500 mt-4">
                You can skip this step if you don't want to select any preferences now.
              </p>
            </div>
            
            <div className="flex justify-between">
              <button 
                onClick={prevStep} 
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={handleSubmit} 
                className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Complete Registration <Check className="ml-2" size={16} />
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <UserPlus size={48} className="mx-auto text-red-600" />
          <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Create Your Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            Join us to get personalized content based on your preferences
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
          {/* Progress Indicator */}
          <div className="flex mb-8 justify-between">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= stepNumber ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNumber}
                </div>
                <div className="text-xs mt-2 text-gray-500">
                  {stepNumber === 1 ? 'Details' : stepNumber === 2 ? 'Photo' : 'Preferences'}
                </div>
              </div>
            ))}
          </div>
          
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default MultiStepRegister;