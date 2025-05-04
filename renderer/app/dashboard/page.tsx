"use client";
import React, { useEffect } from "react"
import { BarChart2, FilePlus, PlusCircle, Search, TrendingUp } from "lucide-react"
import { useDashboardStats } from "../../lib/useDashboardStats"
import { useRouter } from "next/navigation"
import { useAuth } from "../../store/auth"

function StatCard({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-6 min-w-[220px] transition-transform hover:scale-[1.03] duration-200">
      <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${color} bg-opacity-10`}>{icon}</div>
      <div>
        <div className="text-xs text-[#757575] font-roboto mb-1">{title}</div>
        <div className="text-2xl font-semibold text-[#001B48] font-inter">{value}</div>
      </div>
    </div>
  )
}

function QuickAction({ label, icon, onClick, color }: { label: string; icon: React.ReactNode; onClick?: () => void; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium shadow-sm bg-white hover:bg-[#D6E8EE] transition-colors duration-150 border border-transparent hover:border-[#018ABE] focus:outline-none focus:ring-2 focus:ring-[#018ABE] ${color}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

function RecentActivityItem({ title, date, description }: { title: string; date: string; description: string }) {
  return (
    <div className="flex flex-col gap-1 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-center">
        <span className="font-medium text-[#001B48]">{title}</span>
        <span className="text-xs text-[#757575]">{date}</span>
      </div>
      <span className="text-sm text-[#757575]">{description}</span>
    </div>
  )
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" })
}

export default function DashboardPage() {
  const { data, loading, error } = useDashboardStats()
  const router = useRouter()
  const { user } = useAuth()

  // Handler para acciones protegidas
  const requireAuth = (cb: () => void) => {
    if (!user) {
      router.push("/login")
      return
    }
    cb()
  }

  // El dashboard se muestra siempre, con o sin usuario
  return (
    <div className="flex flex-col gap-8">
      {/* Sección 1: Estadísticas generales */}
      <section className="flex flex-wrap gap-6 animate-fade-in">
        {loading ? (
          <div className="text-[#757575]">Cargando estadísticas...</div>
        ) : error ? (
          <div className="text-[#F44336]">{error}</div>
        ) : data ? (
          <>
            <StatCard
              title="Contratos Vigentes"
              value={String(data.totals.active)}
              icon={<BarChart2 size={28} className="text-[#018ABE]" />}
              color="bg-[#018ABE]"
            />
            <StatCard
              title="Contratos Próximos a Vencer"
              value={String(data.totals.expiring)}
              icon={<TrendingUp size={28} className="text-[#FF9800]" />}
              color="bg-[#FF9800]"
            />
            <StatCard
              title="Contratos Vencidos"
              value={String(data.totals.expired)}
              icon={<BarChart2 size={28} className="text-[#F44336]" />}
              color="bg-[#F44336]"
            />
            <StatCard
              title="Total Contratos"
              value={String(data.totals.total)}
              icon={<BarChart2 size={28} className="text-[#018ABE]" />}
              color="bg-[#018ABE]"
            />
          </>
        ) : null}
      </section>

      {/* Sección 2: Acciones rápidas */}
      <section className="flex flex-wrap gap-4 animate-fade-in-up">
        <QuickAction
          label="Nuevo Contrato"
          icon={<FilePlus size={20} className="text-[#018ABE]" />}
          color=""
          onClick={() => requireAuth(() => router.push("/contracts/new"))}
        />
        <QuickAction
          label="Nuevo Suplemento"
          icon={<PlusCircle size={20} className="text-[#02457A]" />}
          color=""
          onClick={() => requireAuth(() => router.push("/contracts"))}
        />
        <QuickAction
          label="Buscar Contrato"
          icon={<Search size={20} className="text-[#001B48]" />}
          color=""
          onClick={() => router.push("/contracts")}
        />
        <QuickAction
          label="Ver Estadísticas Avanzadas"
          icon={<BarChart2 size={20} className="text-[#018ABE]" />}
          color=""
          onClick={() => router.push("/statistics")}
        />
      </section>

      {/* Sección 3: Actividades recientes */}
      <section className="flex flex-col gap-3 animate-fade-in-up">
        <h2 className="text-lg font-semibold text-[#001B48] mb-2 font-inter">Actividades recientes</h2>
        {loading ? (
          <div className="text-[#757575]">Cargando actividades...</div>
        ) : error ? (
          <div className="text-[#F44336]">{error}</div>
        ) : data && data.recentActivity && data.recentActivity.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.recentActivity.map((item) => (
              <RecentActivityItem
                key={item.id}
                title={item.title}
                date={formatDate(item.updatedAt)}
                description={`Contrato: ${item.contractNumber} · Por: ${item.createdBy.name}`}
              />
            ))}
          </div>
        ) : (
          <div className="text-[#757575]">No hay actividades recientes.</div>
        )}
      </section>

      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(32px); }
          to { opacity: 1; transform: none; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  )
} 