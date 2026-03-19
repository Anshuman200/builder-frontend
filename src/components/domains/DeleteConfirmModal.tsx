"use client";

import React from 'react';
import { Modal, Typography, Button, Space, Alert } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  domainName: string;
  isDeleting: boolean;
  error?: string;
  deleteTitle?: string;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  domainName,
  isDeleting,
  error,
  deleteTitle = "Delete Domain"
}: DeleteConfirmModalProps) {
  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
          <span>{deleteTitle}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>,
        <Button
          key="delete"
          type="primary"
          danger
          loading={isDeleting}
          onClick={onConfirm}
        >
          Confirm Delete
        </Button>,
      ]}
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <p>
          Are you sure you want to delete <Text strong>{domainName}</Text>?
          This will also remove the associated Cloudflare Worker proxy and custom hostnames.
        </p>
        
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
          />
        )}
      </Space>
    </Modal>
  );
}
