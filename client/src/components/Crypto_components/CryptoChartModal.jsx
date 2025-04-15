import React from 'react';
import Modal from 'react-modal';
import { Line } from 'react-chartjs-2';
import '@/css/components/Crypto_components/CryptoChartModal.css';

Modal.setAppElement('#root');

const CryptoChartModal = ({
  isOpen,
  onClose,
  coin,
  chartData,
  chartLoading,
  timeframe,
  onTimeframeChange,
}) => {
  const timeframes = [
    { label: "1D", value: 1 },
    { label: "7D", value: 7 },
    { label: "30D", value: 30 },
    { label: "90D", value: 90 },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel={`${coin?.name} Price Chart`}
      className="crypto-modal-content"
      overlayClassName="crypto-modal-overlay"
    >
      <h2 className="modal-title">{coin?.name} Price Chart</h2>

      <div className="timeframe-buttons">
        {timeframes.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onTimeframeChange({ target: { value } })}
            className={`timeframe-button ${value === timeframe ? 'active' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {chartLoading ? (
        <p className="loading-text">Loading chart...</p>
      ) : chartData ? (
        <Line data={chartData} />
      ) : (
        <p className="loading-text">No chart data available.</p>
      )}

      <button onClick={onClose} className="modal-close-button">
        Close
      </button>
    </Modal>
  );
};

export default CryptoChartModal;
