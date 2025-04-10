import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/renderer/components/ui/dialog';
import { Button } from '@/renderer/components/ui/button';
import { Input } from '@/renderer/components/ui/input';
import { Textarea } from '@/renderer/components/ui/textarea';
import { Calendar } from '@/renderer/components/ui/calendar';

const SupplementModal = ({ isOpen, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    description: '',
    date: new Date(),
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.file) {
      const filePath = await window.electronAPI.files.select({
        filters: [{ name: 'Documentos', extensions: ['pdf', 'doc', 'docx'] }]
      });
      formData.filePath = filePath;
    }
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Editar Suplemento' : 'Nuevo Suplemento'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Descripción</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descripción del suplemento..."
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Fecha</label>
            <Calendar
              selected={formData.date}
              onSelect={(date) => setFormData({...formData, date})}
              className="rounded-md border"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Documento</label>
            <Input
              type="file"
              onChange={(e) => setFormData({...formData, file: e.target.files[0]})}
              accept=".pdf,.doc,.docx"
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SupplementModal;