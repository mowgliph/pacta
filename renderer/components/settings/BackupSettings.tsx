import React, { useState, useEffect } from "react";
import { backupApi } from "../../api/backup";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";

// Opciones de programación predefinidas
const SCHEDULE_OPTIONS = [
  { label: "Diario (medianoche)", value: "0 0 * * *" },
  { label: "Diario (mediodía)", value: "0 12 * * *" },
  { label: "Semanal (domingo)", value: "0 0 * * 0" },
  { label: "Mensual (día 1)", value: "0 0 1 * *" },
  { label: "Personalizado", value: "custom" },
];

// Opciones de retención
const RETENTION_OPTIONS = [
  { label: "7 días", value: 7 },
  { label: "15 días", value: 15 },
  { label: "30 días", value: 30 },
  { label: "60 días", value: 60 },
  { label: "90 días", value: 90 },
  { label: "Personalizado", value: "custom" },
];

export default function BackupSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scheduleOption, setScheduleOption] = useState(
    SCHEDULE_OPTIONS[0].value
  );
  const [customCron, setCustomCron] = useState("");
  const [retentionOption, setRetentionOption] = useState(
    RETENTION_OPTIONS[2].value
  );
  const [customRetention, setCustomRetention] = useState(30);
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState("");

  // Cargar configuración actual
  useEffect(() => {
    const fetchScheduleConfig = async () => {
      try {
        const response = await backupApi.getScheduleConfig();

        if (response.success && response.config) {
          setEnabled(response.config.enabled);
          setRetentionOption(response.config.retentionDays);

          // Determinar si es una opción predefinida o personalizada
          const foundSchedule = SCHEDULE_OPTIONS.find(
            (option) => option.value === response.config.cronExpression
          );

          if (foundSchedule) {
            setScheduleOption(foundSchedule.value);
          } else {
            setScheduleOption("custom");
            setCustomCron(response.config.cronExpression);
          }

          const foundRetention = RETENTION_OPTIONS.find(
            (option) => option.value === response.config.retentionDays
          );

          if (foundRetention) {
            setRetentionOption(foundRetention.value);
          } else {
            setRetentionOption("custom");
            setCustomRetention(response.config.retentionDays);
          }
        }
      } catch (err) {
        console.error("Error al cargar la configuración de respaldos:", err);
        setError("No se pudo cargar la configuración de respaldos");
      } finally {
        setLoading(false);
      }
    };

    fetchScheduleConfig();
  }, []);

  // Guardar configuración
  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const cronExpression =
        scheduleOption === "custom" ? customCron : scheduleOption;
      const retentionDays =
        retentionOption === "custom" ? customRetention : retentionOption;

      // Validar la expresión cron personalizada
      if (scheduleOption === "custom" && !validateCronExpression(customCron)) {
        setError(
          'La expresión cron no es válida. Utilice el formato "minuto hora día-del-mes mes día-de-la-semana"'
        );
        setSaving(false);
        return;
      }

      const response = await backupApi.updateScheduleConfig({
        cronExpression,
        retentionDays: Number(retentionDays),
        enabled,
      });

      if (response.success) {
        toast.success("Configuración de respaldos actualizada correctamente");
      } else {
        setError(response.error || "Error al actualizar la configuración");
        toast.error("No se pudo actualizar la configuración");
      }
    } catch (err) {
      console.error("Error al guardar la configuración:", err);
      setError("Error al guardar la configuración");
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  // Función para validar expresión cron
  const validateCronExpression = (cron: string): boolean => {
    // Expresión regular simple para validar el formato cron básico
    const cronRegex =
      /^(\*|([0-9]|[1-5][0-9])) (\*|([0-9]|1[0-9]|2[0-3])) (\*|([1-9]|[12][0-9]|3[01])) (\*|([1-9]|1[0-2])) (\*|([0-6]))$/;
    return cronRegex.test(cron);
  };

  // Ejecutar limpieza manual de respaldos antiguos
  const handleCleanOldBackups = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await backupApi.cleanOldBackups();

      if (response.success) {
        toast.success("Respaldos antiguos eliminados correctamente");
      } else {
        setError(response.error || "Error al limpiar respaldos antiguos");
        toast.error("No se pudieron limpiar los respaldos antiguos");
      }
    } catch (err) {
      console.error("Error al limpiar respaldos antiguos:", err);
      setError("Error al limpiar respaldos antiguos");
      toast.error("Error al limpiar respaldos antiguos");
    } finally {
      setSaving(false);
    }
  };

  // Verificar si el usuario es administrador
  if (!user || !user.role || user.role.name !== "Administrador") {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <p className="text-red-500">
          No tiene permisos para acceder a esta sección
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow animate-pulse">
        <p>Cargando configuración...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Configuración de respaldos automáticos
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Habilitar/deshabilitar respaldos automáticos */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Respaldos automáticos</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Programación de respaldos */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Frecuencia de respaldo
          </label>
          <select
            value={scheduleOption}
            onChange={(e) => setScheduleOption(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!enabled}
          >
            {SCHEDULE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {scheduleOption === "custom" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expresión cron personalizada
              </label>
              <input
                type="text"
                value={customCron}
                onChange={(e) => setCustomCron(e.target.value)}
                placeholder="0 0 * * *"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!enabled}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formato: minuto(0-59) hora(0-23) día-del-mes(1-31) mes(1-12)
                día-de-la-semana(0-6)
              </p>
            </div>
          )}
        </div>

        {/* Período de retención */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Período de retención de respaldos
          </label>
          <select
            value={retentionOption}
            onChange={(e) =>
              setRetentionOption(
                e.target.value === "custom" ? "custom" : Number(e.target.value)
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            disabled={!enabled}
          >
            {RETENTION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {retentionOption === "custom" && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Días de retención personalizados
              </label>
              <input
                type="number"
                value={customRetention}
                onChange={(e) => setCustomRetention(Number(e.target.value))}
                min="1"
                max="365"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={!enabled}
              />
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleCleanOldBackups}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            Limpiar respaldos antiguos
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={saving}
          >
            {saving ? "Guardando..." : "Guardar configuración"}
          </button>
        </div>
      </div>
    </div>
  );
}
