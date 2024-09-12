import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { Colors } from '../../../styles/global';

export function ImageDisplay({ image, isMobile, handleCopyLink }) {
    return (
        <Box display="flex" flexDirection="column" alignItems="center" mt={2}>
            <img src={image.imageURL} alt="Generated" style={{ maxWidth: '100%', borderRadius: '8px' }} />
            <Box display="flex" alignItems="center" mt={1}>
                <Typography variant="body2" color="textSecondary" style={{ marginRight: '8px' }}>
                    {image.prompt}
                </Typography>
                <Tooltip title="Copy Image URL">
                    <IconButton size="small" onClick={handleCopyLink} style={{ color: Colors.lime }}>
                        <FileCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        </Box>
    );
}