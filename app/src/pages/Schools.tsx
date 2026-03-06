import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  School,
  Loader2,
  Plus,
  Search,
  MapPin,
  Phone,
  Users,
  GraduationCap,
  MoreHorizontal
} from 'lucide-react';
import { schoolService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import type { School as SchoolType } from '@/types';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Schools() {
  const { hasRole } = useAuth();
  const canAddSchool = hasRole(['ceo_haca', 'admin', 'leadership']);

  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolType[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSchool, setNewSchool] = useState({
    name: '',
    address: '',
    place: '',
    contactNumber: '',
    email: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterSchools();
  }, [searchQuery, schools]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [schoolsResponse, analyticsResponse] = await Promise.all([
        schoolService.getAll(),
        schoolService.getAnalytics()
      ]);
      setSchools(schoolsResponse.data.schools);
      setFilteredSchools(schoolsResponse.data.schools);
      setAnalytics(analyticsResponse.data.analytics);
    } catch (error) {
      toast.error('Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  };

  const filterSchools = () => {
    if (searchQuery) {
      const filtered = schools.filter(school =>
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.place.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSchools(filtered);
    } else {
      setFilteredSchools(schools);
    }
  };

  const handleCreateSchool = async () => {
    try {
      await schoolService.create(newSchool);
      toast.success('School created successfully');
      setIsCreateDialogOpen(false);
      setNewSchool({
        name: '',
        address: '',
        place: '',
        contactNumber: '',
        email: ''
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create school');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (



    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schools</h1>
          <p className="text-muted-foreground mt-1">
            Manage partner schools and institutions
          </p>
        </div>
        {canAddSchool && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add School
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New School</DialogTitle>
                <DialogDescription>
                  Add a new partner school or institution
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div>
                  <Label>School Name</Label>
                  <Input
                    value={newSchool.name}
                    onChange={(e) => setNewSchool({ ...newSchool, name: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    value={newSchool.address}
                    onChange={(e) => setNewSchool({ ...newSchool, address: e.target.value })}
                    placeholder="Enter address"
                  />
                </div>
                <div>
                  <Label>Place/City</Label>
                  <Input
                    value={newSchool.place}
                    onChange={(e) => setNewSchool({ ...newSchool, place: e.target.value })}
                    placeholder="Enter place/city"
                  />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input
                    value={newSchool.contactNumber}
                    onChange={(e) => setNewSchool({ ...newSchool, contactNumber: e.target.value })}
                    placeholder="Enter contact number"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newSchool.email}
                    onChange={(e) => setNewSchool({ ...newSchool, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <Button onClick={handleCreateSchool} className="w-full">
                  Add School
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Schools</p>
                  <p className="text-3xl font-bold">{analytics.totalSchools}</p>
                </div>
                <School className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Batches</p>
                  <p className="text-3xl font-bold">{analytics.totalBatches}</p>
                </div>
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-3xl font-bold">{analytics.totalStudents}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search schools by name, place, or address..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Schools Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>School</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Stats</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchools.map((school) => {
                const schoolStats = analytics?.schoolsList?.find((s: any) => s.id === school._id);
                return (
                  <TableRow key={school._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <School className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{school.name}</p>
                          {school.email && (
                            <p className="text-sm text-muted-foreground">{school.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{school.place}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{school.address}</p>
                    </TableCell>
                    <TableCell>
                      {school.contactNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{school.contactNumber}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span>{schoolStats?.totalBatches || 0} batches</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{schoolStats?.totalStudents || 0} students</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit School</DropdownMenuItem>
                          <Link to={`/batches?school=${school._id}`}>
                            <DropdownMenuItem>View Batches</DropdownMenuItem>
                          </Link>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No schools found</h3>
          <p className="text-muted-foreground">
            {searchQuery ? 'Try adjusting your search' : 'Add your first school to get started'}
          </p>
        </div>
      )}
    </div>

  );
}
