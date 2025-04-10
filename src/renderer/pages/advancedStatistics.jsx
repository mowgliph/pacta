import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'wouter';
import Carousel from '../components/carousel';

const data = [
  { name: 'Jan', pv: 2400, amt: 2400 },
  { name: 'Feb', pv: 1398, amt: 2210 },
  { name: 'Mar', pv: 9800, amt: 2290 },
  { name: 'Apr', pv: 3908, amt: 2000 },
  { name: 'May', pv: 4800, amt: 2181 },
  { name: 'Jun', pv: 3800, amt: 2500 },
  { name: 'Jul', pv: 4300, amt: 2100 },
];

const AdvancedStatistics = () => {
  const navigate = useNavigate();

  const exportReport = () => {
    // Implementar la exportación de reportes (PDF/CSV)
    alert('Reporte exportado');
  };

  return (
    <div className="p-8">
      <h1 className="text-title mb-4">Estadísticas Avanzadas</h1>
      <div className="mb-8">
        <Carousel>
          <div className="p-4">
            <LineChart
              width={730}
              height={250}
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="amt" stroke="#82ca9d" />
            </LineChart>
          </div>
          <div className="p-4">
            {/* Otro gráfico o contenido */}
            <p className="text-secondary-gray">Gráfico 2</p>
          </div>
        </Carousel>
      </div>
      <div className="mt-4">
        <button className="bg-primary-blue text-white p-2 rounded" onClick={exportReport}>Exportar Reporte</button>
      </div>
      <div className="mt-8">
        <button className="bg-primary-blue text-white p-2 rounded" onClick={() => navigate('/dashboard')}>Volver</button>
      </div>
    </div>
  );
};

export default AdvancedStatistics;