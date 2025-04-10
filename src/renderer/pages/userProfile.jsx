import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useNavigate } from 'wouter';
import useStore from '../store/useStore';
import ModalComponent from '../components/modal';

const UserProfile = () => {
  const navigate = useNavigate();
  const { logout } = useStore();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const onSubmit = async (data) => {
    try {
      const response = await fetch('http://localhost:3001/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Perfil actualizado con éxito');
      } else {
        toast.error('Error al actualizar el perfil');
      }
    } catch (error) {
      toast.error('Ocurrió un error');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="p-8">
      <h1 className="text-title mb-4">Perfil de Usuario</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow-lg">
        <div className="mb-4">
          <label htmlFor="username" className="block mb-2 text-subtitle">Username</label>
          <input
            type="text"
            id="username"
            {...register('username', { required: 'Username is required' })}
            className="w-full p-2 border rounded"
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block mb-2 text-subtitle">Email</label>
          <input
            type="email"
            id="email"
            {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" } })}
            className="w-full p-2 border rounded"
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block mb-2 text-subtitle">Nueva Contraseña</label>
          <input
            type="password"
            id="password"
            {...register('password')}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="notifications" className="block mb-2 text-subtitle">Notificaciones</label>
          <input
            type="checkbox"
            id="notifications"
            {...register('notifications')}
            className="mr-2"
          />
          <label htmlFor="notifications" className="text-secondary-gray">Recibir notificaciones</label>
        </div>
        <button type="submit" className="bg-primary-blue text-white p-2 rounded">Guardar</button>
        <button className="ml-4 bg-error-red text-white p-2 rounded" onClick={() => setIsModalOpen(true)}>Cerrar Sesión</button>
      </form>
      {isModalOpen && (
        <ModalComponent title="Confirmar Cierre de Sesión" onClose={() => setIsModalOpen(false)}>
          <p className="text-secondary-gray">¿Estás seguro de que quieres cerrar sesión?</p>
          <div className="flex justify-end space-x-4">
            <button
              id="cancel-modal"
              className="bg-secondary-gray text-white p-2 rounded"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </button>
            <button
              id="confirm-modal"
              className="bg-error-red text-white p-2 rounded"
              onClick={() => {
                setIsModalOpen(false);
                handleLogout();
              }}
            >
              Confirmar
            </button>
          </div>
        </ModalComponent>
      )}
    </div>
  );
};

export default UserProfile;