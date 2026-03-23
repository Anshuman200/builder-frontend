"use client";

import { useState, useEffect } from "react";
import { Form, Input, Button, Avatar, Upload, Spin, Tabs } from "antd";
import { UserIcon, CameraIcon, LockClosedIcon, IdentificationIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/hooks/useAuth";
import { useUpdateProfile, useChangePassword } from "@/lib/api/queries";
import { useToasts } from "@/hooks/useToasts";
import { s3Service } from "@/lib/services/s3-service";
import { useRouter } from "next/navigation";

interface Props {
  onSuccess?: () => void;
  backUrl: string;
}

export function ProfileSettingsForm({ onSuccess, backUrl }: Props) {
  const { user, setUser } = useAuth();
  const { success, error: toastError } = useToasts();
  const updateProfileMut = useUpdateProfile();
  const changePasswordMut = useChangePassword();
  const router = useRouter();
  
  const [personalForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  useEffect(() => {
    if (user) {
      personalForm.setFieldsValue({
        name: user.name,
      });
      setTempAvatar((user as any).profilePic || null);
    }
  }, [user, personalForm]);

  const handleUpload = async (file: File) => {
    const localUrl = URL.createObjectURL(file);
    setTempAvatar(localUrl);
    setIsUploading(true);
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/\s+/g, '_');
      const key = `avatars/${user?._id || 'anon'}/${timestamp}_${safeName}`;
      
      const uploadResult = await s3Service.uploadFile(file, key);
      const url = s3Service.getPublicUrl((uploadResult as any).key);
      
      if (url) {
        setTempAvatar(url);
        
        // Auto-save the profile picture to the database immediately
        const res = await updateProfileMut.mutateAsync({
          profilePic: url
        });
        
        if ((res as any)?.user) {
          setUser((res as any).user);
        }
        
        success("Profile picture updated");
      }
    } catch (err) {
      toastError("Failed to upload avatar");
      setTempAvatar((user as any)?.profilePic || null); // Revert on error
    } finally {
      setIsUploading(false);
      // We don't revokeObjectURL here immediately to allow the transition to the new S3 URL
    }
    return false; // Prevent default upload
  };

  const onUpdateProfile = async (values: { name: string }) => {
    try {
      const res = await updateProfileMut.mutateAsync({
        name: values.name,
        profilePic: tempAvatar || ""
      });
      
      if ((res as any)?.user) {
        setUser((res as any).user);
      }

      success("Profile updated successfully");
      
      // Perform a full reload to ensure everything is fresh as requested
      setTimeout(() => {
        window.location.href = backUrl;
      }, 1000);
      
    } catch (err: any) {
      toastError(err?.message || "Failed to update profile");
    }
  };

  const onChangePassword = async (values: any) => {
    try {
      await changePasswordMut.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword
      });
      success("Password changed successfully");
      passwordForm.resetFields();
      
      setTimeout(() => {
        window.location.href = backUrl;
      }, 1000);
    } catch (err: any) {
      toastError(err?.message || "Failed to change password");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-1">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="profile-settings-tabs"
        items={[
          {
            key: "personal",
            label: (
              <div className="flex items-center gap-1.5 font-bold">
                <IdentificationIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Personal Info</span>
                <span className="sm:hidden">Profile</span>
              </div>
            ),
            children: (
              <div className="pt-6">
                <Form
                  form={personalForm}
                  layout="vertical"
                  onFinish={onUpdateProfile}
                >
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group avatar-wrapper">
                      <Avatar
                        size={120}
                        src={tempAvatar}
                        icon={!tempAvatar && <UserIcon className="w-14 h-14" />}
                        className="border-4 border-indigo-500/20 shadow-xl bg-neutral-900"
                      />
                      <Upload
                        accept="image/*"
                        showUploadList={false}
                        beforeUpload={handleUpload}
                        disabled={isUploading}
                      >
                        <button
                          type="button"
                          className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors border-2 border-neutral-950 active:scale-95"
                        >
                          {isUploading ? <Spin size="small" /> : <CameraIcon className="w-5 h-5" />}
                        </button>
                      </Upload>
                    </div>
                  </div>

                  <Form.Item
                    label={<span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Full Name</span>}
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input 
                      size="large" 
                      placeholder="Your name" 
                      className="bg-neutral-900! border-neutral-800! text-white! rounded-xl h-12"
                    />
                  </Form.Item>

                  <div className="mt-8 flex gap-3">
                    <Button 
                      onClick={() => router.push(backUrl)} 
                      className="flex-1 h-12 rounded-xl border-neutral-800 text-neutral-400 font-bold hover:text-white! hover:border-neutral-700!"
                    >
                      Back
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={updateProfileMut.isPending}
                      className="flex-1 h-12 rounded-xl bg-indigo-600 border-none font-bold shadow-lg shadow-indigo-500/20"
                    >
                      Save Changes
                    </Button>
                  </div>
                </Form>
              </div>
            )
          },
          {
            key: "security",
            label: (
              <div className="flex items-center gap-1.5 font-bold">
                <LockClosedIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Security</span>
                <span className="sm:hidden">Password</span>
              </div>
            ),
            children: (
              <div className="pt-6">
                <Form
                  form={passwordForm}
                  layout="vertical"
                  onFinish={onChangePassword}
                >
                  <Form.Item
                    label={<span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Current Password</span>}
                    name="oldPassword"
                    rules={[{ required: true, message: 'Enter your current password' }]}
                  >
                    <Input.Password 
                      size="large" 
                      placeholder="••••••••" 
                      className="bg-neutral-900! border-neutral-800! text-white! rounded-xl h-12"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">New Password</span>}
                    name="newPassword"
                    rules={[
                      { required: true, message: 'Enter a new password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                  >
                    <Input.Password 
                      size="large" 
                      placeholder="••••••••" 
                      className="bg-neutral-900! border-neutral-800! text-white! rounded-xl h-12"
                    />
                  </Form.Item>

                  <Form.Item
                    label={<span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Confirm New Password</span>}
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true, message: 'Confirm your new password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('Passwords do not match'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password 
                      size="large" 
                      placeholder="••••••••" 
                      className="bg-neutral-900! border-neutral-800! text-white! rounded-xl h-12"
                    />
                  </Form.Item>

                  <div className="mt-8 flex gap-3">
                    <Button 
                      onClick={() => router.push(backUrl)} 
                      className="flex-1 h-12 rounded-xl border-neutral-800 text-neutral-400 font-bold hover:text-white! hover:border-neutral-700!"
                    >
                      Back
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={changePasswordMut.isPending}
                      className="flex-1 h-12 rounded-xl bg-indigo-600 border-none font-bold shadow-lg shadow-indigo-500/20"
                    >
                      Update Password
                    </Button>
                  </div>
                </Form>
              </div>
            )
          }
        ]}
      />

      <style jsx global>{`
        .profile-settings-tabs .ant-tabs-nav {
          margin-bottom: 0px;
        }
        .profile-settings-tabs .ant-tabs-nav::before {
          border-bottom-color: rgba(255,255,255,0.05);
        }
        .profile-settings-tabs .ant-tabs-tab {
          padding: 12px 0;
          color: rgba(255,255,255,0.4);
        }
        .profile-settings-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: rgb(99 102 241) !important;
        }
        .profile-settings-tabs .ant-tabs-ink-bar {
          background: rgb(99 102 241) !important;
        }
        @media (max-width: 640px) {
          .avatar-wrapper .ant-avatar {
            width: 100px !important;
            height: 100px !important;
            line-height: 100px !important;
          }
          .avatar-wrapper .ant-avatar .heroicons-user-icon {
            width: 40px !important;
            height: 40px !important;
          }
        }
      `}</style>
    </div>
  );
}
