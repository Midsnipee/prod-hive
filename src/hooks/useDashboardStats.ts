import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Fetch all data in parallel
      const [materialsRes, serialsRes, ordersRes, assignmentsRes] = await Promise.all([
        supabase.from('materials').select('stock, category'),
        supabase.from('serials').select('status, warranty_end'),
        supabase.from('orders').select('status'),
        supabase.from('assignments').select('id')
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (serialsRes.error) throw serialsRes.error;
      if (ordersRes.error) throw ordersRes.error;
      if (assignmentsRes.error) throw assignmentsRes.error;

      const materials = materialsRes.data || [];
      const serials = serialsRes.data || [];
      const orders = ordersRes.data || [];
      const assignments = assignmentsRes.data || [];

      // Calculate stats
      const totalStock = materials.reduce((sum, m) => sum + (m.stock || 0), 0);
      const serialsInStock = serials.filter(s => s.status === 'En stock').length;
      const pendingOrders = orders.filter(o => o.status !== 'Livré').length;
      const activeAssignments = assignments.length;

      // Warranty warnings
      const now = new Date();
      const warningDate = new Date();
      warningDate.setDate(warningDate.getDate() + 90);
      
      const warrantyWarnings = serials.filter(s => {
        if (!s.warranty_end) return false;
        const warrantyEnd = new Date(s.warranty_end);
        return warrantyEnd > now && warrantyEnd <= warningDate;
      }).length;

      return {
        totalStock,
        serialsInStock,
        pendingOrders,
        activeAssignments,
        warrantyWarnings,
        materials,
        serials,
        orders
      };
    }
  });
};
