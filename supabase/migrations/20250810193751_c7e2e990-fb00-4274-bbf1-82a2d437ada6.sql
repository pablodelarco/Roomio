-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  apartment_id UUID NOT NULL,
  provider TEXT NOT NULL,
  bill_type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  period_start DATE,
  period_end DATE,
  ready_to_pay BOOLEAN DEFAULT false,
  is_paid BOOLEAN DEFAULT false,
  paid_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- Create policy for bills access
CREATE POLICY "Allow all operations on bills" 
ON public.bills 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();