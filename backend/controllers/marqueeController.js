import { supabase } from '../config/supabase.js';

// Get all active marquee updates
export const getMarqueeUpdates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marquee_updates')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (error) {
      console.error('Error fetching marquee updates:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch marquee updates',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error in getMarqueeUpdates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Add new marquee update (Admin only)
export const addMarqueeUpdate = async (req, res) => {
  try {
    const { message, priority = 0, created_by = 'admin' } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const { data, error } = await supabase
      .from('marquee_updates')
      .insert([
        {
          message: message.trim(),
          priority: parseInt(priority) || 0,
          created_by: created_by,
          updated_by: created_by
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error adding marquee update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to add marquee update',
        error: error.message
      });
    }

    res.status(201).json({
      success: true,
      message: 'Marquee update added successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in addMarqueeUpdate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update marquee update (Admin only)
export const updateMarqueeUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, priority, is_active, updated_by = 'admin' } = req.body;

    const updateData = {};
    if (message !== undefined) updateData.message = message.trim();
    if (priority !== undefined) updateData.priority = parseInt(priority);
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    updateData.updated_by = updated_by;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('marquee_updates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating marquee update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update marquee update',
        error: error.message
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Marquee update not found'
      });
    }

    res.json({
      success: true,
      message: 'Marquee update updated successfully',
      data: data
    });
  } catch (error) {
    console.error('Error in updateMarqueeUpdate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete marquee update (Admin only)
export const deleteMarqueeUpdate = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('marquee_updates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting marquee update:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete marquee update',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Marquee update deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteMarqueeUpdate:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all marquee updates (including inactive) - Admin only
export const getAllMarqueeUpdates = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('marquee_updates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all marquee updates:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch marquee updates',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error in getAllMarqueeUpdates:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};