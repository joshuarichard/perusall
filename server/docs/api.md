# Perusall API Documentation

Base URL: `http://localhost:3001`

All endpoints return JSON. Errors use a standard `{ "error": string }` shape.

---

## Users

### GET /api/users

List all users, sorted alphabetically by name.

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "name": "Dr. Smith",
    "role": "instructor",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

## Readings

### GET /api/readings

List all readings with their creator and annotation count, newest first.

**Response** `200 OK`

```json
[
  {
    "id": "uuid",
    "title": "Introduction to Machine Learning",
    "description": "An overview of ML concepts...",
    "createdBy": "user-uuid",
    "createdAt": "2024-01-15T00:00:00.000Z",
    "creator": {
      "id": "user-uuid",
      "name": "Dr. Smith",
      "role": "instructor",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "_count": {
      "annotations": 3
    }
  }
]
```

### GET /api/readings/:id

Get a single reading with all its annotations (newest first).

**Response** `200 OK`

```json
{
  "id": "uuid",
  "title": "Introduction to Machine Learning",
  "description": "An overview of ML concepts...",
  "createdBy": "user-uuid",
  "createdAt": "2024-01-15T00:00:00.000Z",
  "creator": { ... },
  "annotations": [
    {
      "id": "uuid",
      "content": "Great reading!",
      "readingId": "reading-uuid",
      "authorId": "user-uuid",
      "createdAt": "2024-01-16T10:00:00.000Z",
      "author": {
        "id": "user-uuid",
        "name": "Sarah",
        "role": "student",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ]
}
```

**Response** `404 Not Found`

```json
{ "error": "Reading not found" }
```

### POST /api/readings

Create a new reading. Intended for instructors.

**Request Body**

| Field         | Type   | Required | Notes                      |
| ------------- | ------ | -------- | -------------------------- |
| `title`       | string | yes      | Trimmed; must be non-empty |
| `description` | string | yes      | Trimmed; must be non-empty |
| `createdBy`   | string | yes      | User ID of the creator     |

```json
{
  "title": "New Reading",
  "description": "Description of the reading",
  "createdBy": "user-uuid"
}
```

**Response** `201 Created`

Returns the created reading with creator and annotation count (same shape as list items).

**Response** `400 Bad Request`

```json
{ "error": "Title and description are required" }
```

### GET /api/readings/:id/stats

Instructor stats for a reading: total annotations and unique student count.

**Response** `200 OK`

```json
{
  "readingId": "uuid",
  "annotationCount": 6,
  "uniqueStudents": 3
}
```

**Response** `404 Not Found`

```json
{ "error": "Reading not found" }
```

---

## Annotations

### POST /api/annotations

Create an annotation on a reading. Intended for students.

**Request Body**

| Field       | Type   | Required | Notes                      |
| ----------- | ------ | -------- | -------------------------- |
| `content`   | string | yes      | Trimmed; must be non-empty |
| `readingId` | string | yes      | ID of the reading          |
| `authorId`  | string | yes      | User ID of the author      |

```json
{
  "content": "This section was really insightful",
  "readingId": "reading-uuid",
  "authorId": "user-uuid"
}
```

**Response** `201 Created`

```json
{
  "id": "uuid",
  "content": "This section was really insightful",
  "readingId": "reading-uuid",
  "authorId": "user-uuid",
  "createdAt": "2024-01-20T00:00:00.000Z",
  "author": {
    "id": "user-uuid",
    "name": "Sarah",
    "role": "student",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response** `400 Bad Request`

```json
{ "error": "Annotation content cannot be empty" }
```

```json
{ "error": "readingId and authorId are required" }
```

### PATCH /api/annotations/:id

Update an annotation's content. Only the original author can edit.

**Request Body**

| Field      | Type   | Required | Notes                      |
| ---------- | ------ | -------- | -------------------------- |
| `content`  | string | yes      | Trimmed; must be non-empty |
| `authorId` | string | yes      | Must match original author |

```json
{
  "content": "Updated comment",
  "authorId": "user-uuid"
}
```

**Response** `200 OK`

Returns the updated annotation with author (same shape as POST response).

**Response** `400 Bad Request`

```json
{ "error": "Annotation content cannot be empty" }
```

**Response** `403 Forbidden`

```json
{ "error": "You can only edit your own annotations" }
```

**Response** `404 Not Found`

```json
{ "error": "Annotation not found" }
```

### DELETE /api/annotations/:id

Delete an annotation. Only the original author can delete.

**Request Body**

| Field      | Type   | Required | Notes                      |
| ---------- | ------ | -------- | -------------------------- |
| `authorId` | string | yes      | Must match original author |

```json
{
  "authorId": "user-uuid"
}
```

**Response** `200 OK`

```json
{ "success": true }
```

**Response** `403 Forbidden`

```json
{ "error": "You can only delete your own annotations" }
```

**Response** `404 Not Found`

```json
{ "error": "Annotation not found" }
```
