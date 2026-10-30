function notFound(req, res, next) {
    res.status(404).json({message: `Route not found: ${req.originalUrl}`});
    }

    function errorHandler(err, req, res, next) {
        // Duplicate (pehle se maujood) value par saaf message do
        if (err.code === 11000) {
            const field = Object.keys(err.keyPattern || {}).includes('invoiceNumber')
                ? 'Yeh invoice number'
                : 'Yeh value';
            return res.status(409).json({ message: `${field} pehle se maujood hai` });
        }

        const status = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
        res.status(status).json({
            message: err.message || 'server error',
            stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
        });
    }
     module.exports = {notFound, errorHandler };