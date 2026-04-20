import apiClient from './client'

// --- 知识库相关 ---
export const getKBList = () => apiClient.get('/kb')
export const createKB = (data: { name: string; description?: string }) => apiClient.post('/kb', data)
export const deleteKB = (kbId: string) => apiClient.delete(`/kb/${kbId}`)
export const getKBStats = (kbId: string) => apiClient.get(`/kb/${kbId}/stats`)

// --- 对话相关 ---
export const getConversations = (userId: string, page = 1, pageSize = 20, kbId?: string) => 
  apiClient.get('/conversations', { 
    params: { user_id: userId, page, page_size: pageSize, kb_id: kbId } 
  })

export const createConversation = (userId: string, title: string, kbId?: string) => 
  apiClient.post('/conversations', 
    { title, kb_id: kbId },
    { params: { user_id: userId } }
  )

export const getConversation = (conversationId: string) => 
  apiClient.get(`/conversations/${conversationId}`)

export const updateConversation = (conversationId: string, title: string) => 
  apiClient.put(`/conversations/${conversationId}`, { title })

export const deleteConversation = (conversationId: string) => 
  apiClient.delete(`/conversations/${conversationId}`)

export const getMessages = (convId: string, page = 1, pageSize = 50) => 
  apiClient.get(`/conversations/${convId}/messages`, { 
    params: { page, page_size: pageSize } 
  })

export const sendMessage = (convId: string, content: string, kbId?: string) => 
  apiClient.post(`/conversations/${convId}/messages`, {
    content,
    kb_id: kbId
  })

export const getConversationStats = (conversationId: string) => 
  apiClient.get(`/conversations/${conversationId}/stats`)

// --- RAG 查询相关 ---
export const ragQuery = (query: string, kbId?: string, conversationId?: string, topK = 5) => 
  apiClient.post('/rag/query', null, {
    params: {
      query,
      kb_id: kbId,
      conversation_id: conversationId,
      top_k: topK
    }
  })

// --- 任务相关 ---
export const getTasks = () => apiClient.get('/tasks')

// --- 模型相关 ---
export const getModels = () => apiClient.get('/models')

// --- 文档相关 ---
export const getDocuments = (params: { page?: number; page_size?: number }) => apiClient.get('/rag/documents', { params })
export const uploadDocument = (formData: FormData) => apiClient.post('/rag/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const deleteDocument = (docId: string) => apiClient.delete(`/rag/documents/${docId}`)
export const associateDocumentWithKB = (docId: string, kbId: string) => apiClient.put(`/rag/documents/${docId}/kb/${kbId}`)
export const triggerParsing = (docId: string) => apiClient.post(`/rag/documents/${docId}/parse`)
