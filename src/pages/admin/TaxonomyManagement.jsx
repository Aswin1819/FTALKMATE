import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { 
  Tag, 
  Search, 
  Plus,
  Edit,
  Trash2,
  Languages,
  List,
  Check,
  X
} from 'lucide-react';
import adminInstance from '../../features/auth/adminInstance';


const TaxonomyManagement = () => {
  // Search states
  const [tagSearchTerm, setTagSearchTerm] = useState('');
  const [languageSearchTerm, setLanguageSearchTerm] = useState('');
  const [roomTypeSearchTerm, setRoomTypeSearchTerm] = useState('');
  
  // Data states
  const [tags, setTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [languages, setLanguages] = useState([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRoomTypes, setLoadingRoomTypes] = useState(false);

  // Dialog states
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [languageDialogOpen, setLanguageDialogOpen] = useState(false);
  const [roomTypeDialogOpen, setRoomTypeDialogOpen] = useState(false);

  // New item states
  const [newTag, setNewTag] = useState({ name: "", color: "#7E69AB" });
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#7E69AB');
  const [newLanguage, setNewLanguage] = useState({ name: "", code: "" });
  const [newLanguageName, setNewLanguageName] = useState('');
  const [newLanguageCode, setNewLanguageCode] = useState('');
  const [newRoomType, setNewRoomType] = useState({ name: "", description: "" });
  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [newRoomTypeDescription, setNewRoomTypeDescription] = useState('');

  // Editing states
  const [editingTag, setEditingTag] = useState(null);
  const [editingTagId, setEditingTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('');
  const [editingLanguage, setEditingLanguage] = useState(null);
  const [editingLanguageId, setEditingLanguageId] = useState(null);
  const [editLanguageName, setEditLanguageName] = useState('');
  const [editLanguageCode, setEditLanguageCode] = useState('');
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [editingRoomTypeId, setEditingRoomTypeId] = useState(null);
  const [editRoomTypeName, setEditRoomTypeName] = useState('');
  const [editRoomTypeDescription, setEditRoomTypeDescription] = useState('');

  // Filter data based on search terms
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
  );

  const filteredLanguages = languages.filter(language => 
    language.name.toLowerCase().includes(languageSearchTerm.toLowerCase()) ||
    language.code.toLowerCase().includes(languageSearchTerm.toLowerCase())
  );

  const filteredRoomTypes = roomTypes.filter(roomType => 
    roomType.name.toLowerCase().includes(roomTypeSearchTerm.toLowerCase()) ||
    roomType.description.toLowerCase().includes(roomTypeSearchTerm.toLowerCase())
  );

  // Fetch all taxonomy data on mount
  useEffect(() => {
    fetchTags();
    fetchLanguages();
    fetchRoomTypes();
    // eslint-disable-next-line
  }, []);



  // Fetch tags
  const fetchTags = async () => {
    setLoadingTags(true);
    try {
      const res = await adminInstance.get("http://localhost:8000/api/rooms/tags/");
      setTags(res.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  // Fetch languages
  const fetchLanguages = async () => {
    setLoadingLanguages(true);
    try {
      const res = await adminInstance.get("http://localhost:8000/api/users/languages/");
      setLanguages(res.data);
    } catch (error) {
      console.error('Error fetching languages:', error);
    } finally {
      setLoadingLanguages(false);
    }
  };

  // Fetch room types
  const fetchRoomTypes = async () => {
    setLoadingRoomTypes(true);
    try {
      const res = await adminInstance.get("http://localhost:8000/api/rooms/roomtypes/");
      setRoomTypes(res.data);
    } catch (error) {
      console.error('Error fetching room types:', error);
    } finally {
      setLoadingRoomTypes(false);
    }
  };

  // Tag CRUD operations
  const handleCreateTag = async () => {
    try {
      const tagData = { name: newTagName, color: newTagColor };
      await adminInstance.post("http://localhost:8000/api/rooms/tags/", tagData);
      setNewTagName('');
      setNewTagColor('#7E69AB');
      setTagDialogOpen(false);
      fetchTags();
    } catch (error) {
      console.error('Error creating tag:', error);
    }
  };

  const handleEditTag = (tag) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const handleSaveTag = async (id) => {
    try {
      const tagData = { name: editTagName, color: editTagColor };
      await adminInstance.put(`http://localhost:8000/api/rooms/tags/${id}/`, tagData);
      setEditingTagId(null);
      setEditTagName('');
      setEditTagColor('');
      fetchTags();
    } catch (error) {
      console.error('Error updating tag:', error);
    }
  };

  const handleCancelTagEdit = () => {
    setEditingTagId(null);
    setEditTagName('');
    setEditTagColor('');
  };

  const handleDeleteTag = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await adminInstance.delete(`http://localhost:8000/api/rooms/tags/${id}/`);
        fetchTags();
      } catch (error) {
        console.error('Error deleting tag:', error);
      }
    }
  };

  // Language CRUD operations
  const handleCreateLanguage = async () => {
    try {
      const languageData = { name: newLanguageName, code: newLanguageCode };
      await adminInstance.post("http://localhost:8000/api/users/languages/", languageData);
      setNewLanguageName('');
      setNewLanguageCode('');
      setLanguageDialogOpen(false);
      fetchLanguages();
    } catch (error) {
      console.error('Error creating language:', error);
    }
  };

  const handleEditLanguage = (language) => {
    setEditingLanguageId(language.id);
    setEditLanguageName(language.name);
    setEditLanguageCode(language.code);
  };

  const handleSaveLanguage = async (id) => {
    try {
      const languageData = { name: editLanguageName, code: editLanguageCode };
      await adminInstance.put(`http://localhost:8000/api/users/languages/${id}/`, languageData);
      setEditingLanguageId(null);
      setEditLanguageName('');
      setEditLanguageCode('');
      fetchLanguages();
    } catch (error) {
      console.error('Error updating language:', error);
    }
  };

  const handleCancelLanguageEdit = () => {
    setEditingLanguageId(null);
    setEditLanguageName('');
    setEditLanguageCode('');
  };

  const handleDeleteLanguage = async (id) => {
    if (window.confirm('Are you sure you want to delete this language?')) {
      try {
        await adminInstance.delete(`http://localhost:8000/api/users/languages/${id}/`);
        fetchLanguages();
      } catch (error) {
        console.error('Error deleting language:', error);
      }
    }
  };

  // Room Type CRUD operations
  const handleCreateRoomType = async () => {
    try {
      const roomTypeData = { name: newRoomTypeName, description: newRoomTypeDescription };
      await adminInstance.post("http://localhost:8000/api/rooms/roomtypes/", roomTypeData);
      setNewRoomTypeName('');
      setNewRoomTypeDescription('');
      setRoomTypeDialogOpen(false);
      fetchRoomTypes();
    } catch (error) {
      console.error('Error creating room type:', error);
    }
  };

  const handleEditRoomType = (roomType) => {
    setEditingRoomTypeId(roomType.id);
    setEditRoomTypeName(roomType.name);
    setEditRoomTypeDescription(roomType.description);
  };

  const handleSaveRoomType = async (id) => {
    try {
      const roomTypeData = { name: editRoomTypeName, description: editRoomTypeDescription };
      await adminInstance.put(`http://localhost:8000/api/rooms/roomtypes/${id}/`, roomTypeData);
      setEditingRoomTypeId(null);
      setEditRoomTypeName('');
      setEditRoomTypeDescription('');
      fetchRoomTypes();
    } catch (error) {
      console.error('Error updating room type:', error);
    }
  };

  const handleCancelRoomTypeEdit = () => {
    setEditingRoomTypeId(null);
    setEditRoomTypeName('');
    setEditRoomTypeDescription('');
  };

  const handleDeleteRoomType = async (id) => {
    if (window.confirm('Are you sure you want to delete this room type?')) {
      try {
        await adminInstance.delete(`http://localhost:8000/api/rooms/roomtypes/${id}/`);
        fetchRoomTypes();
      } catch (error) {
        console.error('Error deleting room type:', error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Taxonomy Management</h1>
      </div>
      
      <Card className="bg-black/30 backdrop-blur-sm border-white/10 text-white overflow-hidden">
        <Tabs defaultValue="tags" className="w-full">
          <TabsList className="w-full bg-black/30 border-b border-white/10 rounded-none p-0">
            <TabsTrigger 
              value="tags" 
              className="flex-1 rounded-none data-[state=active]:bg-white/10 data-[state=active]:shadow-none data-[state=active]:text-neon-purple"
            >
              <Tag className="h-4 w-4 mr-2" />
              Tags
            </TabsTrigger>
            <TabsTrigger 
              value="languages" 
              className="flex-1 rounded-none data-[state=active]:bg-white/10 data-[state=active]:shadow-none data-[state=active]:text-neon-blue"
            >
              <Languages className="h-4 w-4 mr-2" />
              Languages
            </TabsTrigger>
            <TabsTrigger 
              value="roomTypes" 
              className="flex-1 rounded-none data-[state=active]:bg-white/10 data-[state=active]:shadow-none data-[state=active]:text-neon-green"
            >
              <List className="h-4 w-4 mr-2" />
              Room Types
            </TabsTrigger>
          </TabsList>
          
          {/* Tags Tab */}
          <TabsContent value="tags" className="m-0 p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search tags..." 
                  value={tagSearchTerm}
                  onChange={(e) => setTagSearchTerm(e.target.value)}
                  className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              
              <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-neon-purple to-neon-pink text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Tag
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Create New Tag</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new tag that users can associate with their rooms and profiles.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="tagName" className="text-sm font-medium text-gray-300">Tag Name</label>
                      <Input
                        id="tagName"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="e.g., Beginner, Grammar, Travel"
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="tagColor" className="text-sm font-medium text-gray-300">Color</label>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="tagColor"
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          className="w-16 h-10 p-1 bg-black/30 border-white/10"
                        />
                        <div className="flex-1">
                          <Input
                            value={newTagColor}
                            onChange={(e) => setNewTagColor(e.target.value)}
                            className="bg-black/30 border-white/10 text-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="text-sm font-medium text-gray-300">Preview</label>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge 
                          style={{backgroundColor: `${newTagColor}20`, color: newTagColor}}
                          className="hover:bg-opacity-30"
                        >
                          {newTagName || "Tag Preview"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={() => setTagDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateTag}
                      className="bg-gradient-to-r from-neon-purple to-neon-pink text-white"
                      disabled={!newTagName.trim()}
                    >
                      Create Tag
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <Card key={tag.id} className="bg-black/20 backdrop-blur-sm border-white/10">
                    <CardContent className="p-4">
                      {editingTagId === tag.id ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Input
                              value={editTagName}
                              onChange={(e) => setEditTagName(e.target.value)}
                              className="bg-black/30 border-white/10 text-white text-sm"
                              placeholder="Tag name"
                            />
                            <div className="flex gap-2 items-center">
                              <Input
                                type="color"
                                value={editTagColor}
                                onChange={(e) => setEditTagColor(e.target.value)}
                                className="w-10 h-8 p-1 bg-black/30 border-white/10"
                              />
                              <Input
                                value={editTagColor}
                                onChange={(e) => setEditTagColor(e.target.value)}
                                className="bg-black/30 border-white/10 text-white font-mono text-xs"
                              />
                            </div>
                            <Badge 
                              style={{backgroundColor: `${editTagColor}20`, color: editTagColor}}
                              className="hover:bg-opacity-30 text-sm"
                            >
                              {editTagName || "Preview"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-neon-green hover:text-white hover:bg-neon-green/20"
                              onClick={() => handleSaveTag(tag.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-red-400 hover:text-white hover:bg-red-400/20"
                              onClick={handleCancelTagEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-3" 
                              style={{backgroundColor: tag.color}}
                            />
                            <Badge 
                              style={{backgroundColor: `${tag.color}20`, color: tag.color}}
                              className="hover:bg-opacity-30 text-sm"
                            >
                              {tag.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-gray-400 hover:text-neon-blue hover:bg-white/10"
                              onClick={() => handleEditTag(tag)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-400 hover:bg-white/10"
                              onClick={() => handleDeleteTag(tag.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-center text-gray-500 col-span-full py-8">
                  {loadingTags ? "Loading tags..." : "No tags match your search criteria"}
                </p>
              )}
            </div>
          </TabsContent>
          
          {/* Languages Tab */}
          <TabsContent value="languages" className="m-0 p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search languages..." 
                  value={languageSearchTerm}
                  onChange={(e) => setLanguageSearchTerm(e.target.value)}
                  className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              
              <Dialog open={languageDialogOpen} onOpenChange={setLanguageDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-neon-blue to-neon-green text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Language
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Add New Language</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Add a new language that users can learn and teach on the platform.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label htmlFor="languageName" className="text-sm font-medium text-gray-300">Language Name</label>
                      <Input
                        id="languageName"
                        value={newLanguageName}
                        onChange={(e) => setNewLanguageName(e.target.value)}
                        placeholder="e.g., Portuguese"
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="languageCode" className="text-sm font-medium text-gray-300">Language Code (ISO)</label>
                      <Input
                        id="languageCode"
                        value={newLanguageCode}
                        onChange={(e) => setNewLanguageCode(e.target.value)}
                        placeholder="e.g., pt"
                        className="bg-black/30 border-white/10 text-white"
                      />
                    </div>
                  </div>
                  <DialogFooter className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      className="text-gray-400 hover:text-white hover:bg-white/10"
                      onClick={() => setLanguageDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateLanguage}
                      className="bg-gradient-to-r from-neon-blue to-neon-green text-white"
                      disabled={!newLanguageName.trim() || !newLanguageCode.trim()}
                    >
                      Add Language
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="rounded-lg overflow-x-auto">
              <Table>
                <TableHeader className="bg-black/40">
                  <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400">Language</TableHead>
                    <TableHead className="text-gray-400">Code</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLanguages.length > 0 ? (
                    filteredLanguages.map((language) => (
                      <TableRow key={language.id} className="border-b border-white/5 hover:bg-white/5">
                        {editingLanguageId === language.id ? (
                          <>
                            <TableCell>
                              <Input
                                value={editLanguageName}
                                onChange={(e) => setEditLanguageName(e.target.value)}
                                className="bg-black/30 border-white/10 text-white"
                                placeholder="Language name"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                value={editLanguageCode}
                                onChange={(e) => setEditLanguageCode(e.target.value)}
                                className="bg-black/30 border-white/10 text-white font-mono"
                                placeholder="Code"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-neon-green hover:text-white hover:bg-neon-green/20"
                                  onClick={() => handleSaveLanguage(language.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-red-400 hover:text-white hover:bg-red-400/20"
                                  onClick={handleCancelLanguageEdit}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="font-medium text-white">{language.name}</TableCell>
                            <TableCell className="font-mono">{language.code}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-neon-blue hover:bg-white/10"
                                  onClick={() => handleEditLanguage(language)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-white/10"
                                  onClick={() => handleDeleteLanguage(language.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                        {loadingLanguages ? "Loading languages..." : "No languages match your search criteria"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
       
          
          {/* Room Types Tab */}
            <TabsContent value="roomTypes" className="m-0 p-6">
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                    placeholder="Search room types..." 
                    value={roomTypeSearchTerm}
                    onChange={(e) => setRoomTypeSearchTerm(e.target.value)}
                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500"
                />
                </div>
                
                <Dialog open={roomTypeDialogOpen} onOpenChange={setRoomTypeDialogOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
                    <Plus className="h-4 w-4 mr-2" /> Add Room Type
                    </Button>
                </DialogTrigger>
                <DialogContent className="bg-black/90 backdrop-blur-xl border-white/10 text-white">
                    <DialogHeader>
                    <DialogTitle>Add New Room Type</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Define a new type of conversation room that users can create.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="roomTypeName" className="text-sm font-medium text-gray-300">Room Type Name</label>
                        <Input
                        id="roomTypeName"
                        value={newRoomTypeName}
                        onChange={(e) => setNewRoomTypeName(e.target.value)}
                        placeholder="e.g., Study Group"
                        className="bg-black/30 border-white/10 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="roomTypeDescription" className="text-sm font-medium text-gray-300">Description</label>
                        <Input
                        id="roomTypeDescription"
                        value={newRoomTypeDescription}
                        onChange={(e) => setNewRoomTypeDescription(e.target.value)}
                        placeholder="Briefly describe the purpose of this room type"
                        className="bg-black/30 border-white/10 text-white"
                        />
                    </div>
                    </div>
                    <DialogFooter className="flex justify-end gap-2">
                    <Button 
                        variant="ghost" 
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                        onClick={() => setRoomTypeDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateRoomType}
                        className="bg-gradient-to-r from-neon-green to-neon-blue text-white"
                        disabled={!newRoomTypeName.trim() || !newRoomTypeDescription.trim()}
                    >
                        Add Room Type
                    </Button>
                    </DialogFooter>
                </DialogContent>
                </Dialog>
            </div>
            
            <div className="rounded-lg overflow-x-auto">
                <Table>
                <TableHeader className="bg-black/40">
                    <TableRow className="border-b border-white/10 hover:bg-transparent">
                    <TableHead className="text-gray-400">Room Type</TableHead>
                    <TableHead className="text-gray-400">Description</TableHead>
                    <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {filteredRoomTypes.length > 0 ? (
                    filteredRoomTypes.map((roomType) => (
                        <TableRow key={roomType.id} className="border-b border-white/5 hover:bg-white/5">
                        {editingRoomTypeId === roomType.id ? (
                            <>
                            <TableCell>
                                <Input
                                value={editRoomTypeName}
                                onChange={(e) => setEditRoomTypeName(e.target.value)}
                                className="bg-black/30 border-white/10 text-white"
                                placeholder="Room type name"
                                />
                            </TableCell>
                            <TableCell>
                                <Input
                                value={editRoomTypeDescription}
                                onChange={(e) => setEditRoomTypeDescription(e.target.value)}
                                className="bg-black/30 border-white/10 text-white"
                                placeholder="Description"
                                />
                            </TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-neon-green hover:text-white hover:bg-neon-green/20"
                                    onClick={() => handleSaveRoomType(roomType.id)}
                                >
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-red-400 hover:text-white hover:bg-red-400/20"
                                    onClick={handleCancelRoomTypeEdit}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                                </div>
                            </TableCell>
                            </>
                        ) : (
                            <>
                            <TableCell className="font-medium text-white">{roomType.name}</TableCell>
                            <TableCell className="max-w-sm truncate">{roomType.description}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-neon-blue hover:bg-white/10"
                                    onClick={() => handleEditRoomType(roomType)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0 text-gray-400 hover:text-red-400 hover:bg-white/10"
                                    onClick={() => handleDeleteRoomType(roomType.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                </div>
                            </TableCell>
                            </>
                        )}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center text-gray-500">
                        {loadingRoomTypes ? "Loading room types..." : "No room types match your search criteria"}
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default TaxonomyManagement;