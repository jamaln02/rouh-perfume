import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface UserProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  role: string;
}

const AdminUsers = () => {
  const { lang } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    const merged = (profiles || []).map((p: any) => {
      const userRole = (roles || []).find((r: any) => r.user_id === p.id);
      return { ...p, role: userRole?.role || "user" };
    });
    setUsers(merged);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const updateRole = async (userId: string, role: "admin" | "user") => {
    const { error } = await supabase.from("user_roles").update({ role }).eq("user_id", userId);
    if (error) toast.error(error.message);
    else { toast.success(lang === "ar" ? "تم تحديث الصلاحية" : "Role updated"); fetchUsers(); }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">{lang === "ar" ? "إدارة المستخدمين" : "Manage Users"}</h1>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{lang === "ar" ? "الاسم" : "Name"}</TableHead>
              <TableHead>{lang === "ar" ? "الهاتف" : "Phone"}</TableHead>
              <TableHead>{lang === "ar" ? "الصلاحية" : "Role"}</TableHead>
              <TableHead>{lang === "ar" ? "تاريخ التسجيل" : "Joined"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                <TableCell>{u.phone || "—"}</TableCell>
                <TableCell>
                  <Select value={u.role} onValueChange={(v) => updateRole(u.id, v as "admin" | "user")}>
                    <SelectTrigger className="w-28">
                      <Badge className={u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}>
                        {u.role === "admin" ? (lang === "ar" ? "أدمن" : "Admin") : (lang === "ar" ? "مستخدم" : "User")}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">{lang === "ar" ? "مستخدم" : "User"}</SelectItem>
                      <SelectItem value="admin">{lang === "ar" ? "أدمن" : "Admin"}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
            {users.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">{lang === "ar" ? "لا يوجد مستخدمون" : "No users"}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminUsers;
