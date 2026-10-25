import multer from 'multer';
export default multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024, files: 1, fields: 0 },
    fileFilter(req, file, callback) {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype)) {
            const error = new Error('Solo PNG, JPEG o WebP'); error.status = 400; return callback(error);
        }
        callback(null, true);
    },
});
