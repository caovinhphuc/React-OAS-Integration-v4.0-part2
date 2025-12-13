import React from "react";

interface OrderDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  order: any;
}

const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ open, onClose, order }) => {
  if (!open || !order) return null;

  return (
    <div className="order-details-dialog">
      <div className="dialog-content">
        <h2>Order Details</h2>
        <pre>{JSON.stringify(order, null, 2)}</pre>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default OrderDetailsDialog;
