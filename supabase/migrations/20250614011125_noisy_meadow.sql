/*
  # Add Budget Helper Functions

  1. Functions
    - `increment_budget_spent` - Safely increment budget spent amount
    - `get_or_create_budget` - Get existing budget or create new one
*/

-- Function to safely increment budget spent amount
CREATE OR REPLACE FUNCTION increment_budget_spent(
  p_user_id uuid,
  p_category text,
  p_amount decimal
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or update budget
  INSERT INTO budgets (user_id, category, budgeted, spent)
  VALUES (p_user_id, p_category, 0, p_amount)
  ON CONFLICT (user_id, category)
  DO UPDATE SET spent = budgets.spent + p_amount;
END;
$$;

-- Function to get or create budget for a category
CREATE OR REPLACE FUNCTION get_or_create_budget(
  p_user_id uuid,
  p_category text
)
RETURNS budgets
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  budget_record budgets;
BEGIN
  -- Try to get existing budget
  SELECT * INTO budget_record
  FROM budgets
  WHERE user_id = p_user_id AND category = p_category;
  
  -- If not found, create it
  IF NOT FOUND THEN
    INSERT INTO budgets (user_id, category, budgeted, spent)
    VALUES (p_user_id, p_category, 0, 0)
    RETURNING * INTO budget_record;
  END IF;
  
  RETURN budget_record;
END;
$$;