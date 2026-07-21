"use client";

import { createClient } from '../utils/supabase/client';
const supabase = createClient();

/**
 * Converts a File object (JPG, PNG) to a WebP File object using the Canvas API.
 * @param {File} file 
 * @param {number} quality 0 to 1
 * @returns {Promise<File>}
 */
export const convertToWebP = (file, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    // If it's already a webp or not an image (like a PDF), just return it
    if (!file.type.startsWith('image/') || file.type === 'image/webp' || file.type === 'image/svg+xml') {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (!blob) {
            return reject(new Error('Canvas is empty'));
          }
          // Replace extension with .webp
          const fileName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const webpFile = new File([blob], fileName, {
            type: 'image/webp',
            lastModified: Date.now(),
          });
          resolve(webpFile);
        }, 'image/webp', quality);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a file to Supabase Storage, converting images to WebP automatically.
 * @param {File} file 
 * @param {string} bucket 
 * @param {string} folder 
 * @returns {Promise<string>} Public URL of the uploaded file
 */
export const uploadFile = async (file, bucket = 'porto-ibnughaotz-tzy', folder = 'uploads') => {
  try {
    let fileToUpload = file;
    // Compress & Convert to WebP if it's an image
    if (file.type.startsWith('image/')) {
      fileToUpload = await convertToWebP(file);
    }

    const fileExt = fileToUpload.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, fileToUpload, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Deletes a file from Supabase Storage given its URL.
 * @param {string} fileUrl The URL of the file (e.g. /storage/folder/file.ext or full URL)
 * @param {string} bucket The bucket name
 */
export const deleteFile = async (fileUrl, bucket = 'porto-ibnughaotz-tzy') => {
  if (!fileUrl) return;
  try {
    // Extract the path from the URL.
    // If it's a relative URL like /storage/folder/file.ext, we remove /storage/
    // If it's a full URL, we extract everything after /porto-ibnughaotz-tzy/
    let filePath = fileUrl;
    if (filePath.startsWith('/storage/')) {
      filePath = filePath.replace('/storage/', '');
    } else if (filePath.includes('/public/porto-ibnughaotz-tzy/')) {
      filePath = filePath.split('/public/porto-ibnughaotz-tzy/')[1];
    }
    
    if (!filePath) return;

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
    
    console.log(`Deleted old file: ${filePath}`);
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
