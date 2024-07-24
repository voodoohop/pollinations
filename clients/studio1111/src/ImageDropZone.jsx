import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const ImageDropZone = ({ onImageChange, uploadInstructions, defaultImage }) => {
  const [referenceImage, setReferenceImage] = useState(defaultImage);

  useEffect(() => {
    setReferenceImage(defaultImage);
  }, [defaultImage]);
  
  // Using react-dropzone to handle file drop
  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result); // Notify parent component about the new image
      };
      reader.readAsDataURL(file);
    }
  };

  // Add removeImage function to handle image removal
  const removeImage = () => {
    setReferenceImage(null);
    onImageChange(null); // Notify parent component about the image removal
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: 'image/*',
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        width: '80%',
        maxWidth: '384px',
        height: '200px',
        border: '2px dashed #ccc',
        margin: '20px auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative', // Added for absolute positioning of remove button
      }}
    >
      {referenceImage ? (
        <>
          <img
            src={referenceImage}
            alt="Reference"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {/* Add remove button here */}
          <button
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              border: 'none',
              borderRadius: '50%',
              padding: '5px 10px',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              e.stopPropagation(); // Prevent dropzone from opening file dialog
              removeImage();
            }}
          >
            X
          </button>
        </>
      ) : (
        <div>
          <input {...getInputProps()} />
          <p>{uploadInstructions}</p>
        </div>
      )}
    </div>
  );
};

export default ImageDropZone;
