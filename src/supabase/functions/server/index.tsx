import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify user
async function verifyUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return null;
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return null;
  }

  return user;
}

// ============ AUTH ROUTES ============

// Sign up
app.post('/make-server-743362cc/auth/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Initialize default categories for new user
    const defaultCategories = [
      { name: 'Lương', type: 'income', icon: '💰', isDefault: true },
      { name: 'Học bổng', type: 'income', icon: '🎓', isDefault: true },
      { name: 'Trợ cấp gia đình', type: 'income', icon: '👨‍👩‍👧', isDefault: true },
      { name: 'Làm thêm', type: 'income', icon: '💼', isDefault: true },
      { name: 'Thu nhập khác', type: 'income', icon: '💵', isDefault: true },
      { name: 'Ăn uống', type: 'expense', icon: '🍜', isDefault: true },
      { name: 'Học tập', type: 'expense', icon: '📚', isDefault: true },
      { name: 'Nhà trọ', type: 'expense', icon: '🏠', isDefault: true },
      { name: 'Di chuyển', type: 'expense', icon: '🚗', isDefault: true },
      { name: 'Giải trí', type: 'expense', icon: '🎮', isDefault: true },
      { name: 'Mua sắm', type: 'expense', icon: '🛍️', isDefault: true },
      { name: 'Sức khỏe', type: 'expense', icon: '💊', isDefault: true },
      { name: 'Điện nước', type: 'expense', icon: '💡', isDefault: true },
      { name: 'Internet', type: 'expense', icon: '📱', isDefault: true },
      { name: 'Chi tiêu khác', type: 'expense', icon: '💸', isDefault: true }
    ].map((cat, index) => ({ ...cat, id: `default_${index}` }));

    await kv.set(`user:${data.user.id}:categories`, defaultCategories);
    await kv.set(`user:${data.user.id}:transactions`, []);
    await kv.set(`user:${data.user.id}:budgets`, []);
    await kv.set(`user:${data.user.id}:goals`, []);
    await kv.set(`user:${data.user.id}:reminders`, []);

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ============ TRANSACTIONS ROUTES ============

app.get('/make-server-743362cc/transactions', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transactions = await kv.get(`user:${user.id}:transactions`) || [];
    return c.json({ transactions });
  } catch (error) {
    console.log('Get transactions error:', error);
    return c.json({ error: 'Failed to fetch transactions' }, 500);
  }
});

app.post('/make-server-743362cc/transactions', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const transaction = await c.req.json();
    const transactions = await kv.get(`user:${user.id}:transactions`) || [];
    
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    transactions.push(newTransaction);
    await kv.set(`user:${user.id}:transactions`, transactions);

    return c.json({ transaction: newTransaction });
  } catch (error) {
    console.log('Create transaction error:', error);
    return c.json({ error: 'Failed to create transaction' }, 500);
  }
});

app.put('/make-server-743362cc/transactions/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const transactions = await kv.get(`user:${user.id}:transactions`) || [];
    
    const index = transactions.findIndex((t: any) => t.id === id);
    if (index === -1) {
      return c.json({ error: 'Transaction not found' }, 404);
    }

    transactions[index] = { ...transactions[index], ...updates };
    await kv.set(`user:${user.id}:transactions`, transactions);

    return c.json({ transaction: transactions[index] });
  } catch (error) {
    console.log('Update transaction error:', error);
    return c.json({ error: 'Failed to update transaction' }, 500);
  }
});

app.delete('/make-server-743362cc/transactions/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const transactions = await kv.get(`user:${user.id}:transactions`) || [];
    
    const filtered = transactions.filter((t: any) => t.id !== id);
    await kv.set(`user:${user.id}:transactions`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete transaction error:', error);
    return c.json({ error: 'Failed to delete transaction' }, 500);
  }
});

// ============ CATEGORIES ROUTES ============

app.get('/make-server-743362cc/categories', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const categories = await kv.get(`user:${user.id}:categories`) || [];
    return c.json({ categories });
  } catch (error) {
    console.log('Get categories error:', error);
    return c.json({ error: 'Failed to fetch categories' }, 500);
  }
});

app.post('/make-server-743362cc/categories', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const category = await c.req.json();
    const categories = await kv.get(`user:${user.id}:categories`) || [];
    
    const newCategory = {
      ...category,
      id: Date.now().toString(),
      userId: user.id,
      isDefault: false,
      createdAt: new Date().toISOString()
    };

    categories.push(newCategory);
    await kv.set(`user:${user.id}:categories`, categories);

    return c.json({ category: newCategory });
  } catch (error) {
    console.log('Create category error:', error);
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

app.put('/make-server-743362cc/categories/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const categories = await kv.get(`user:${user.id}:categories`) || [];
    
    const index = categories.findIndex((cat: any) => cat.id === id);
    if (index === -1) {
      return c.json({ error: 'Category not found' }, 404);
    }

    if (categories[index].isDefault) {
      return c.json({ error: 'Cannot edit default category' }, 400);
    }

    categories[index] = { ...categories[index], ...updates };
    await kv.set(`user:${user.id}:categories`, categories);

    return c.json({ category: categories[index] });
  } catch (error) {
    console.log('Update category error:', error);
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

app.delete('/make-server-743362cc/categories/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const categories = await kv.get(`user:${user.id}:categories`) || [];
    
    const category = categories.find((cat: any) => cat.id === id);
    if (category?.isDefault) {
      return c.json({ error: 'Cannot delete default category' }, 400);
    }

    const filtered = categories.filter((cat: any) => cat.id !== id);
    await kv.set(`user:${user.id}:categories`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete category error:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

// ============ BUDGETS ROUTES ============

app.get('/make-server-743362cc/budgets', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const budgets = await kv.get(`user:${user.id}:budgets`) || [];
    return c.json({ budgets });
  } catch (error) {
    console.log('Get budgets error:', error);
    return c.json({ error: 'Failed to fetch budgets' }, 500);
  }
});

app.post('/make-server-743362cc/budgets', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const budget = await c.req.json();
    const budgets = await kv.get(`user:${user.id}:budgets`) || [];
    
    const newBudget = {
      ...budget,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    budgets.push(newBudget);
    await kv.set(`user:${user.id}:budgets`, budgets);

    return c.json({ budget: newBudget });
  } catch (error) {
    console.log('Create budget error:', error);
    return c.json({ error: 'Failed to create budget' }, 500);
  }
});

app.put('/make-server-743362cc/budgets/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const budgets = await kv.get(`user:${user.id}:budgets`) || [];
    
    const index = budgets.findIndex((b: any) => b.id === id);
    if (index === -1) {
      return c.json({ error: 'Budget not found' }, 404);
    }

    budgets[index] = { ...budgets[index], ...updates };
    await kv.set(`user:${user.id}:budgets`, budgets);

    return c.json({ budget: budgets[index] });
  } catch (error) {
    console.log('Update budget error:', error);
    return c.json({ error: 'Failed to update budget' }, 500);
  }
});

app.delete('/make-server-743362cc/budgets/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const budgets = await kv.get(`user:${user.id}:budgets`) || [];
    
    const filtered = budgets.filter((b: any) => b.id !== id);
    await kv.set(`user:${user.id}:budgets`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete budget error:', error);
    return c.json({ error: 'Failed to delete budget' }, 500);
  }
});

// ============ GOALS ROUTES ============

app.get('/make-server-743362cc/goals', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const goals = await kv.get(`user:${user.id}:goals`) || [];
    return c.json({ goals });
  } catch (error) {
    console.log('Get goals error:', error);
    return c.json({ error: 'Failed to fetch goals' }, 500);
  }
});

app.post('/make-server-743362cc/goals', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const goal = await c.req.json();
    const goals = await kv.get(`user:${user.id}:goals`) || [];
    
    const newGoal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    goals.push(newGoal);
    await kv.set(`user:${user.id}:goals`, goals);

    return c.json({ goal: newGoal });
  } catch (error) {
    console.log('Create goal error:', error);
    return c.json({ error: 'Failed to create goal' }, 500);
  }
});

app.put('/make-server-743362cc/goals/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const goals = await kv.get(`user:${user.id}:goals`) || [];
    
    const index = goals.findIndex((g: any) => g.id === id);
    if (index === -1) {
      return c.json({ error: 'Goal not found' }, 404);
    }

    goals[index] = { ...goals[index], ...updates };
    await kv.set(`user:${user.id}:goals`, goals);

    return c.json({ goal: goals[index] });
  } catch (error) {
    console.log('Update goal error:', error);
    return c.json({ error: 'Failed to update goal' }, 500);
  }
});

app.delete('/make-server-743362cc/goals/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const goals = await kv.get(`user:${user.id}:goals`) || [];
    
    const filtered = goals.filter((g: any) => g.id !== id);
    await kv.set(`user:${user.id}:goals`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete goal error:', error);
    return c.json({ error: 'Failed to delete goal' }, 500);
  }
});

// ============ REMINDERS ROUTES ============

app.get('/make-server-743362cc/reminders', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reminders = await kv.get(`user:${user.id}:reminders`) || [];
    return c.json({ reminders });
  } catch (error) {
    console.log('Get reminders error:', error);
    return c.json({ error: 'Failed to fetch reminders' }, 500);
  }
});

app.post('/make-server-743362cc/reminders', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const reminder = await c.req.json();
    const reminders = await kv.get(`user:${user.id}:reminders`) || [];
    
    const newReminder = {
      ...reminder,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    reminders.push(newReminder);
    await kv.set(`user:${user.id}:reminders`, reminders);

    return c.json({ reminder: newReminder });
  } catch (error) {
    console.log('Create reminder error:', error);
    return c.json({ error: 'Failed to create reminder' }, 500);
  }
});

app.put('/make-server-743362cc/reminders/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const updates = await c.req.json();
    const reminders = await kv.get(`user:${user.id}:reminders`) || [];
    
    const index = reminders.findIndex((r: any) => r.id === id);
    if (index === -1) {
      return c.json({ error: 'Reminder not found' }, 404);
    }

    reminders[index] = { ...reminders[index], ...updates };
    await kv.set(`user:${user.id}:reminders`, reminders);

    return c.json({ reminder: reminders[index] });
  } catch (error) {
    console.log('Update reminder error:', error);
    return c.json({ error: 'Failed to update reminder' }, 500);
  }
});

app.delete('/make-server-743362cc/reminders/:id', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const reminders = await kv.get(`user:${user.id}:reminders`) || [];
    
    const filtered = reminders.filter((r: any) => r.id !== id);
    await kv.set(`user:${user.id}:reminders`, filtered);

    return c.json({ success: true });
  } catch (error) {
    console.log('Delete reminder error:', error);
    return c.json({ error: 'Failed to delete reminder' }, 500);
  }
});

// ============ USER PROFILE ROUTES ============

app.get('/make-server-743362cc/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    return c.json({ 
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.name || ''
      }
    });
  } catch (error) {
    console.log('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.put('/make-server-743362cc/profile', async (c) => {
  try {
    const user = await verifyUser(c.req.raw);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const { name, email } = await c.req.json();

    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        email,
        user_metadata: { name }
      }
    );

    if (error) {
      console.log('Update profile error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

Deno.serve(app.fetch);
