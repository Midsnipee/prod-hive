-- Create table for assignment documents
CREATE TABLE public.assignment_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  document_html TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.assignment_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for assignment documents
CREATE POLICY "Authenticated users can view assignment documents" 
ON public.assignment_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Admin and magasinier can manage assignment documents" 
ON public.assignment_documents 
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'magasinier'::app_role));

-- Create index for faster lookups
CREATE INDEX idx_assignment_documents_assignment_id ON public.assignment_documents(assignment_id);