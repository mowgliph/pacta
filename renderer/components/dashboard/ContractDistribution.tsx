import React from "react";
import { motion } from "framer-motion";
import { IconFileText, IconBox } from "@tabler/icons-react";

interface ContractDistributionProps {
  clientCount: number;
  supplierCount: number;
}

export function ContractDistribution({
  clientCount,
  supplierCount,
}: ContractDistributionProps) {
  const total = clientCount + supplierCount;
  const clientPercentage = total > 0 ? (clientCount / total) * 100 : 0;
  const supplierPercentage = total > 0 ? (supplierCount / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">
        Distribución de Contratos
      </h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-blue-50 p-2">
              <IconFileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Clientes</p>
              <p className="text-xs text-gray-500">{clientCount} contratos</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {clientPercentage.toFixed(1)}%
          </p>
        </div>

        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${clientPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-blue-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-green-50 p-2">
              <IconBox className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Proveedores</p>
              <p className="text-xs text-gray-500">{supplierCount} contratos</p>
            </div>
          </div>
          <p className="text-sm font-semibold text-gray-900">
            {supplierPercentage.toFixed(1)}%
          </p>
        </div>

        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${supplierPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full bg-green-500"
          />
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Total de contratos: {total}
        </p>
      </div>
    </div>
  );
}
