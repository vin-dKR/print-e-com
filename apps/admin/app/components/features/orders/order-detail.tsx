/**
 * Order Detail Component
 * Comprehensive order detail page with tabs and all sections
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';
import {  PageLoading } from '@/app/components/ui/loading';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import {
    getOrder,
    updateOrderStatus,
    getOrderInvoice,
    markAsShipped,
    markAsDelivered,
    markPaymentAsPaid,
    processRefund,
    type Order,
    type OrderStatus
} from '@/lib/api/orders.service';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { OrderStatusBadge, PaymentStatusBadge } from './status-badge';
import {
    ArrowLeft,
    Copy,
    Download,
    Printer,
    Mail,
    Package,
    Truck,
    CreditCard,
    Clock,
    MapPin,
    User
} from 'lucide-react';
import Link from 'next/link';

export function OrderDetail({ orderId }: { orderId: string }) {
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [shippingModalOpen, setShippingModalOpen] = useState(false);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [refundModalOpen, setRefundModalOpen] = useState(false);

    useEffect(() => {
        loadOrder();
    }, [orderId]);

    const loadOrder = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await getOrder(orderId);
            setOrder(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load order');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus: OrderStatus, comment?: string) => {
        if (!order) return;
        try {
            await updateOrderStatus(orderId, { status: newStatus, comment });
            await loadOrder();
            setStatusModalOpen(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update order status');
        }
    };

    const handleMarkAsShipped = async (trackingNumber: string, carrier?: string) => {
        if (!order) return;
        try {
            await markAsShipped(orderId, { trackingNumber, carrier });
            await loadOrder();
            setShippingModalOpen(false);
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to mark as shipped');
        }
    };

    const handleMarkAsDelivered = async (notes?: string) => {
        if (!order) return;
        try {
            await markAsDelivered(orderId, { notes });
            await loadOrder();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to mark as delivered');
        }
    };

    const handlePrintInvoice = async () => {
        try {
            const invoiceHtml = await getOrderInvoice(orderId);
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(invoiceHtml);
                printWindow.document.close();
                printWindow.print();
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to load invoice');
        }
    };

    const copyOrderId = () => {
        navigator.clipboard.writeText(orderId);
        alert('Order ID copied to clipboard');
    };

    if (isLoading) {
        return <PageLoading />;
    }

    if (error || !order) {
        return (
            <div className="space-y-4">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>
                <Alert variant="error">{error || 'Order not found'}</Alert>
            </div>
        );
    }

    const address = order.address || order.shippingAddress;
    const canEdit = order.status !== 'SHIPPED' && order.status !== 'DELIVERED';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                    <div className="mt-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={copyOrderId}
                                className="flex items-center gap-1"
                            >
                                <Copy className="h-4 w-4" />
                                Copy ID
                            </Button>
                        </div>
                        <p className="mt-1 text-sm text-gray-600 font-mono">{order.id}</p>
                        <p className="mt-1 text-sm text-gray-500">
                            Created: {formatDateTime(order.createdAt)} •
                            Updated: {formatDateTime(order.updatedAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge status={order.paymentStatus} />
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handlePrintInvoice}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Invoice
                        </Button>
                        <Button variant="outline">
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                        </Button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="items">Items</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                    <TabsTrigger value="shipping">Shipping</TabsTrigger>
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="invoice">Invoice</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Order Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600">Order Date</p>
                                    <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Order Status</p>
                                    <div className="mt-1">
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-medium">{order.paymentMethod}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Status</p>
                                    <div className="mt-1">
                                        <PaymentStatusBadge status={order.paymentStatus} />
                                    </div>
                                </div>
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span>{formatCurrency(order.subtotal || 0)}</span>
                                    </div>
                                    {order.discountAmount && order.discountAmount > 0 && (
                                        <div className="flex justify-between text-sm mb-2 text-green-600">
                                            <span>Discount</span>
                                            <span>-{formatCurrency(order.discountAmount)}</span>
                                        </div>
                                    )}
                                    {order.shippingCharges && order.shippingCharges > 0 && (
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Shipping</span>
                                            <span>{formatCurrency(order.shippingCharges)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-medium">{order.user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <a href={`mailto:${order.user?.email}`} className="text-blue-600 hover:underline">
                                        {order.user?.email}
                                    </a>
                                </div>
                                {order.user?.phone && (
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <a href={`tel:${order.user.phone}`} className="text-blue-600 hover:underline">
                                            {order.user.phone}
                                        </a>
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm text-gray-600">Customer ID</p>
                                    <Link href={`/users/${order.userId}`} className="text-blue-600 hover:underline font-mono text-sm">
                                        {order.userId.slice(0, 8)}...
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Shipping Address */}
                    {address && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5" />
                                    Shipping Address
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1">
                                    <p className="font-medium">{address.street}</p>
                                    <p>
                                        {address.city}, {address.state} {address.zipCode}
                                    </p>
                                    <p>{address.country}</p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setStatusModalOpen(true)}
                                >
                                    <Clock className="h-4 w-4 mr-2" />
                                    Update Status
                                </Button>
                                {order.status === 'PROCESSING' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setShippingModalOpen(true)}
                                    >
                                        <Truck className="h-4 w-4 mr-2" />
                                        Mark as Shipped
                                    </Button>
                                )}
                                {order.status === 'SHIPPED' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleMarkAsDelivered()}
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Mark as Delivered
                                    </Button>
                                )}
                                {order.paymentStatus === 'PENDING' && order.paymentMethod === 'OFFLINE' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setPaymentModalOpen(true)}
                                    >
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Mark as Paid
                                    </Button>
                                )}
                                {order.paymentStatus === 'SUCCESS' && (
                                    <Button
                                        variant="outline"
                                        onClick={() => setRefundModalOpen(true)}
                                    >
                                        Refund
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Items Tab */}
                <TabsContent value="items">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items ({order.items.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {order.items.map((item, index) => (
                                    <div key={item.id || index} className="flex gap-4 border-b pb-6 last:border-0">
                                        {item.product?.images?.[0] && (
                                            <div className="w-24 h-24 rounded border overflow-hidden bg-gray-100 shrink-0">
                                                <img
                                                    src={item.product.images[0].url}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-lg">
                                                        {item.product?.name || `Product ${item.productId}`}
                                                    </h4>
                                                    {item.product?.sku && (
                                                        <p className="text-sm text-gray-500">SKU: {item.product.sku}</p>
                                                    )}
                                                    {item.variant && (
                                                        <p className="text-sm text-gray-600">Variant: {item.variant.name}</p>
                                                    )}
                                                    {item.product?.category && (
                                                        <p className="text-sm text-gray-500">
                                                            Category: {item.product.category.name}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">{formatCurrency(item.price)}</p>
                                                    <p className="text-sm text-gray-500">× {item.quantity}</p>
                                                    <p className="font-bold mt-1">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                            </div>
                                            {item.customText && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                                                    <strong>Custom Text:</strong> {item.customText}
                                                </div>
                                            )}
                                            {item.customDesignUrl && (
                                                <div className="mt-2">
                                                    <a
                                                        href={item.customDesignUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm"
                                                    >
                                                        View Custom Design
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total Items</span>
                                        <span>
                                            {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Payment Tab */}
                <TabsContent value="payment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Payment Method</p>
                                <p className="font-medium">{order.paymentMethod}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Payment Status</p>
                                <div className="mt-1">
                                    <PaymentStatusBadge status={order.paymentStatus} />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Amount</p>
                                <p className="font-bold text-xl">{formatCurrency(order.total)}</p>
                            </div>
                            {order.payments && order.payments.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Payment History</p>
                                    <div className="space-y-2">
                                        {order.payments.map((payment) => (
                                            <div key={payment.id} className="p-3 bg-gray-50 rounded">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDateTime(payment.createdAt)}
                                                        </p>
                                                        {payment.razorpayPaymentId && (
                                                            <p className="text-xs text-gray-400 font-mono mt-1">
                                                                ID: {payment.razorpayPaymentId}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <PaymentStatusBadge status={payment.status} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {address && (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
                                    <div className="p-3 bg-gray-50 rounded">
                                        <p className="font-medium">{address.street}</p>
                                        <p>
                                            {address.city}, {address.state} {address.zipCode}
                                        </p>
                                        <p>{address.country}</p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-600">Shipping Charges</p>
                                <p className="font-medium">{formatCurrency(order.shippingCharges || 0)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {order.statusHistory && order.statusHistory.length > 0 ? (
                                <div className="space-y-4">
                                    {order.statusHistory.map((history, index) => (
                                        <div key={history.id} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className={`w-3 h-3 rounded-full ${index === order.statusHistory!.length - 1 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                                {index < order.statusHistory!.length - 1 && (
                                                    <div className="w-0.5 h-full bg-gray-300 mt-1" />
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <OrderStatusBadge status={history.status} />
                                                    <span className="text-sm text-gray-500">
                                                        {formatDateTime(history.createdAt)}
                                                    </span>
                                                </div>
                                                {history.comment && (
                                                    <p className="text-sm text-gray-600 mt-1">{history.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No status history available</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Invoice Tab */}
                <TabsContent value="invoice">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Invoice</span>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={handlePrintInvoice}>
                                        <Printer className="h-4 w-4 mr-2" />
                                        Print
                                    </Button>
                                    <Button variant="outline">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download PDF
                                    </Button>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="text-gray-600">Invoice will be displayed here. Use Print or Download to view the full invoice.</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Status Update Modal */}
            <StatusUpdateModal
                open={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                currentStatus={order.status}
                onUpdate={handleStatusUpdate}
            />

            {/* Shipping Modal */}
            <ShippingModal
                open={shippingModalOpen}
                onClose={() => setShippingModalOpen(false)}
                onShip={handleMarkAsShipped}
            />

            {/* Payment Modal */}
            <PaymentModal
                open={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                order={order}
                onPaid={async () => {
                    await loadOrder();
                    setPaymentModalOpen(false);
                }}
            />

            {/* Refund Modal */}
            <RefundModal
                open={refundModalOpen}
                onClose={() => setRefundModalOpen(false)}
                order={order}
                onRefund={async () => {
                    await loadOrder();
                    setRefundModalOpen(false);
                }}
            />
        </div>
    );
}

// Status Update Modal
function StatusUpdateModal({
    open,
    onClose,
    currentStatus,
    onUpdate,
}: {
    open: boolean;
    onClose: () => void;
    currentStatus: OrderStatus;
    onUpdate: (status: OrderStatus, comment?: string) => void;
}) {
    const [status, setStatus] = useState<OrderStatus>(currentStatus);
    const [comment, setComment] = useState('');

    const statusOptions: OrderStatus[] = [
        'PENDING_REVIEW',
        'ACCEPTED',
        'REJECTED',
        'PROCESSING',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
    ];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogClose onClose={onClose} />
                <DialogHeader>
                    <DialogTitle>Update Order Status</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>New Status</Label>
                        <select
                            className="w-full mt-1 p-2 border rounded"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as OrderStatus)}
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt.replace(/_/g, ' ')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label>Comment (Optional)</Label>
                        <Input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Add a note about this status change"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={() => onUpdate(status, comment || undefined)}>Update Status</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Shipping Modal
function ShippingModal({
    open,
    onClose,
    onShip,
}: {
    open: boolean;
    onClose: () => void;
    onShip: (trackingNumber: string, carrier?: string) => void;
}) {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [carrier, setCarrier] = useState('');

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogClose onClose={onClose} />
                <DialogHeader>
                    <DialogTitle>Mark Order as Shipped</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Tracking Number *</Label>
                        <Input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="Enter tracking number"
                            required
                        />
                    </div>
                    <div>
                        <Label>Carrier (Optional)</Label>
                        <Input
                            type="text"
                            value={carrier}
                            onChange={(e) => setCarrier(e.target.value)}
                            placeholder="e.g., FedEx, UPS, USPS"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button
                        onClick={() => {
                            if (trackingNumber) {
                                onShip(trackingNumber, carrier || undefined);
                                setTrackingNumber('');
                                setCarrier('');
                            }
                        }}
                        disabled={!trackingNumber}
                    >
                        Mark as Shipped
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Payment Modal
function PaymentModal({
    open,
    onClose,
    order,
    onPaid,
}: {
    open: boolean;
    onClose: () => void;
    order: Order;
    onPaid: () => void;
}) {
    const [amount, setAmount] = useState(order.total.toString());
    const [reference, setReference] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            await markPaymentAsPaid(order.id, {
                amount: parseFloat(amount),
                reference: reference || undefined,
            });
            onPaid();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to mark payment as paid');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogClose onClose={onClose} />
                <DialogHeader>
                    <DialogTitle>Mark Payment as Paid</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                        />
                    </div>
                    <div>
                        <Label>Reference / Notes</Label>
                        <Input
                            type="text"
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Payment reference or notes"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Mark as Paid'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Refund Modal
function RefundModal({
    open,
    onClose,
    order,
    onRefund,
}: {
    open: boolean;
    onClose: () => void;
    order: Order;
    onRefund: () => void;
}) {
    const [amount, setAmount] = useState(order.total.toString());
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!reason.trim()) {
            alert('Please provide a refund reason');
            return;
        }
        try {
            setIsSubmitting(true);
            await processRefund(order.id, {
                amount: parseFloat(amount),
                reason,
            });
            onRefund();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to process refund');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogClose onClose={onClose} />
                <DialogHeader>
                    <DialogTitle>Process Refund</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div>
                        <Label>Refund Amount</Label>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            step="0.01"
                            max={order.total}
                        />
                        <p className="text-xs text-gray-500 mt-1">Order total: {formatCurrency(order.total)}</p>
                    </div>
                    <div>
                        <Label>Refund Reason *</Label>
                        <Input
                            type="text"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Reason for refund"
                            required
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !reason.trim()}>
                        {isSubmitting ? 'Processing...' : 'Process Refund'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
