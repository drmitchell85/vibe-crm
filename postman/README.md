# Postman API Testing

This folder contains Postman collections and environments for testing the FPH CRM API.

## Files

- `FPH-CRM-API.postman_collection.json` - Main API collection with all endpoints
- `FPH-CRM-Local.postman_environment.json` - Local development environment variables

## How to Import

### Option 1: Postman Desktop App

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop both JSON files OR click "Upload Files"
4. Select both:
   - `FPH-CRM-API.postman_collection.json`
   - `FPH-CRM-Local.postman_environment.json`
5. Click **Import**

### Option 2: Postman Web

1. Go to https://web.postman.co
2. Click **Import**
3. Upload both JSON files
4. Click **Import**

## Usage

1. **Select Environment**:
   - Click the environment dropdown (top right)
   - Select "FPH CRM - Local"

2. **Test Endpoints**:
   - Expand "Contacts" folder
   - Click on any request
   - Click **Send**

3. **Variables**:
   - `{{base_url}}` - API base URL (default: http://localhost:3001)
   - `{{contact_id}}` - Contact ID for individual operations (set manually after creating a contact)

## Workflow Example

1. **Create a Contact**:
   - Request: `Create Contact`
   - Copy the `id` from the response

2. **Set Contact ID Variable**:
   - Click environment "FPH CRM - Local"
   - Set `contact_id` value to the copied ID
   - Save

3. **Test Other Operations**:
   - `Get Contact by ID` - Uses `{{contact_id}}`
   - `Update Contact` - Uses `{{contact_id}}`
   - `Delete Contact` - Uses `{{contact_id}}`

## Endpoints Included

- ✅ `GET /api/contacts` - Get all contacts
- ✅ `GET /api/contacts/:id` - Get contact by ID
- ✅ `POST /api/contacts` - Create contact
- ✅ `PUT /api/contacts/:id` - Update contact
- ✅ `DELETE /api/contacts/:id` - Delete contact
- ✅ `GET /api/contacts/search?q=query` - Search contacts
- ✅ `GET /health` - Health check

## Tips

- Use "Send and Download" to save responses
- Use Postman Tests tab to write automated tests
- Use Pre-request Scripts to auto-generate test data
- Export updated collection after making changes
