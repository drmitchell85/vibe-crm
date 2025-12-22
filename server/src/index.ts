import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
