"use client";

import { useState } from "react";
import { Table, Button, Modal, Form, Input, Space, Tag } from "antd";
import { PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useAdminPageTags } from "@/lib/api/adminQuerties";
import { useCreatePageTag, useUpdatePageTag, useDeletePageTag } from "@/lib/api/adminQuerties";
import { useToasts } from "@/hooks/useToasts";
import { CommonContainer } from "@/components/layout/CommonContainer";

export default function AdminPageTagsPage() {
  const { success, error: toastError } = useToasts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<any>(null);
  const [form] = Form.useForm();

  const { data: tags = [], isLoading } = useAdminPageTags();
  const createTagMut = useCreatePageTag();
  const updateTagMut = useUpdatePageTag();
  const deleteTagMut = useDeletePageTag();

  const openCreate = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const openEdit = (tag: any) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name, slug: tag.slug, description: tag.description });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTag(null);
    form.resetFields();
    setIsModalOpen(false);
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingTag) {
        await updateTagMut.mutateAsync({ id: editingTag._id, ...values });
        success("Tag updated successfully");
      } else {
        await createTagMut.mutateAsync(values);
        success("Tag created successfully");
      }
      closeModal();
    } catch (err: any) {
      toastError(err?.message || "Unable to save tag");
    }
  };

  const handleDelete = async (tag: any) => {
    try {
      await deleteTagMut.mutateAsync(tag._id);
      success("Tag deleted successfully");
    } catch (err: any) {
      toastError(err?.message || "Unable to delete tag");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name: string) => <span className="font-semibold">{name}</span>,
    },
    {
      title: "Slug",
      dataIndex: "slug",
      key: "slug",
      render: (slug: string) => <Tag color="blue">{slug}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: 120,
      render: (isActive: boolean) => (
        <Tag color={isActive ? "success" : "default"} style={{ borderRadius: 10, border: "none" }}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 140,
      render: (_: any, tag: any) => (
        <Space>
          <Button type="text" onClick={() => openEdit(tag)} icon={<PencilSquareIcon className="w-4 h-4" />} />
          <Button type="text" danger onClick={() => handleDelete(tag)} icon={<TrashIcon className="w-4 h-4" />} />
        </Space>
      ),
    },
  ];

  return (
    <CommonContainer className="py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">Page Tags</h1>
          <p className="text-sm text-white/50 mt-2">Manage backend-driven tags that can be attached to new projects.</p>
        </div>
        <Button type="primary" icon={<PlusIcon className="w-4 h-4" />} onClick={openCreate}>
          Add Tag
        </Button>
      </div>

      <div className="bg-(--surface) border border-(--border) rounded-3xl overflow-hidden">
        <Table
          rowKey="_id"
          loading={isLoading}
          columns={columns}
          dataSource={tags}
          pagination={{ pageSize: 20 }}
          rowClassName={() => "hover:bg-white/[0.015] transition-colors"}
        />
      </div>

      <Modal
        title={editingTag ? "Edit Tag" : "New Tag"}
        open={isModalOpen}
        onCancel={closeModal}
        okText={editingTag ? "Save" : "Create"}
        onOk={() => form.submit()}
        confirmLoading={createTagMut.isPending || updateTagMut.isPending}
        width={560}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: "Please enter a tag name" }]}> 
            <Input placeholder="Tag name" />
          </Form.Item>
          <Form.Item name="slug" label="Slug" help="Optional. Generated from name if empty.">
            <Input placeholder="optional slug" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} placeholder="Optional description" />
          </Form.Item>
        </Form>
      </Modal>
    </CommonContainer>
  );
}
