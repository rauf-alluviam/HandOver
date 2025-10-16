import React from 'react';
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
} from '@mui/icons-material';

const FileUpload = ({ files, onFilesChange, maxSizeMB = 5, accept = '.pdf' }) => {
  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = selectedFiles.filter(file => {
      if (file.type !== 'application/pdf') {
        alert(`File ${file.name} is not a PDF. Only PDF files are allowed.`);
        return false;
      }
      
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} exceeds the maximum size of ${maxSizeMB}MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      onFilesChange([...files, ...validFiles]);
    }
    
    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data:application/pdf;base64, prefix
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Function to prepare files for API submission
  const prepareFilesForSubmission = async (files, titles) => {
    const preparedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64Data = await convertToBase64(file);
      
      preparedFiles.push({
        attNm: file.name,
        attData: base64Data,
        attTitle: titles[i] || 'WT_DECLARATION'
      });
    }
    
    return preparedFiles;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Attachments
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<AttachFileIcon />}
        >
          Upload PDF
          <input
            type="file"
            hidden
            multiple
            accept={accept}
            onChange={handleFileSelect}
          />
        </Button>
        <Typography variant="caption" sx={{ ml: 1 }}>
          Maximum file size: {maxSizeMB}MB, Only PDF files allowed
        </Typography>
      </Box>

      {files.length > 0 && (
        <List>
          {files.map((file, index) => (
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
            >
              <ListItemIcon>
                <AttachFileIcon />
              </ListItemIcon>
              <ListItemText
                primary={file.name}
                secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default FileUpload;