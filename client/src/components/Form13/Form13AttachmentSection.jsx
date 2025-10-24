// src/components/Form13/Form13AttachmentSection.jsx
import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as CloudUploadIcon,
} from '@mui/icons-material';

const Form13AttachmentSection = ({ formData, onFormDataChange }) => {
  
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      if (file.type !== 'application/pdf') {
        alert(`File ${file.name} is not a PDF. Only PDF files are allowed.`);
        return false;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        alert(`File ${file.name} exceeds the maximum size of 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      onFormDataChange('attachments', '', [...formData.attachments, ...validFiles]);
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    const newFiles = formData.attachments.filter((_, i) => i !== index);
    onFormDataChange('attachments', '', newFiles);
  };

  const getFileTitle = (fileName) => {
    // Map file names to appropriate titles based on document type
    if (fileName.toLowerCase().includes('shipping')) return 'SHIPPING_BILL';
    if (fileName.toLowerCase().includes('invoice')) return 'INVOICE';
    if (fileName.toLowerCase().includes('packing')) return 'PACKING_LIST';
    if (fileName.toLowerCase().includes('license')) return 'EXPORT_LICENSE';
    if (fileName.toLowerCase().includes('declaration')) return 'DECLARATION';
    return 'OTHER_DOCUMENT';
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Document Attachments
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Upload required documents in PDF format (Max 5MB per file)
          </Typography>
          
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 1 }}
          >
            Upload PDF Documents
            <input
              type="file"
              hidden
              multiple
              accept=".pdf"
              onChange={handleFileSelect}
            />
          </Button>
        </Box>

        {formData.attachments.length > 0 ? (
          <List>
            {formData.attachments.map((file, index) => (
              <ListItem
                key={index}
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleRemoveFile(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                }
                sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 1 }}
              >
                <ListItemIcon>
                  <AttachFileIcon />
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Chip 
                        label={getFileTitle(file.name)} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed', borderColor: 'divider', borderRadius: 2 }}>
            <AttachFileIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body1" color="text.disabled">
              No documents uploaded
            </Typography>
            <Typography variant="body2" color="text.disabled">
              Click the upload button to add PDF documents
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2">
            <strong>Required Documents:</strong>
            <br />• Shipping Bill
            <br />• Commercial Invoice
            <br />• Packing List
            <br />• Export License (if applicable)
            <br />• Any other supporting documents
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Form13AttachmentSection;