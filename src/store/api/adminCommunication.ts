import { apiSlice } from "../initalState";
export interface MessageTemplate {
  _id: string;
  name: string;
  message: string;
  contentSid?: string;
}
export interface MessageResult {
  phone: string;
  status: string;
  providerId?: string;
  error?: string;
}
export interface MessageBatch {
  _id: string;
  channel: string;
  message: string;
  createdAt: string;
  results: MessageResult[];
}
export interface RefundAlert {
  _id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  reason: string;
  status: string;
  createdAt: string;
  refundReference?: string;
  adminNote?: string;
  bookingData: {
    trip: string;
    tripTitle?: string;
    selectedDate: string;
    price: number;
    advancePaid: number;
    passengers: {
      name: string;
      email: string;
      phoneNumber: string;
      dropLocation?: string;
    }[];
    selectedSeats: {
      seat: string;
      busIndex: number;
      leg: string;
    }[];
  };
}
const api = apiSlice.enhanceEndpoints({
  addTagTypes: ["messages", "refundAlerts"]
}).injectEndpoints({
  endpoints: builder => ({
    messaging: builder.query<{
      templates: MessageTemplate[];
      batches: MessageBatch[];
      configured: {
        sms: boolean;
        whatsapp: boolean;
      };
    }, void>({
      query: () => "/api/v1/messaging",
      providesTags: ["messages"]
    }),
    saveMessageTemplate: builder.mutation<unknown, {
      id?: string;
      name: string;
      message: string;
      contentSid?: string;
    }>({
      query: ({
        id,
        ...body
      }) => ({
        url: `/api/v1/messaging/templates${id ? `/${id}` : ""}`,
        method: id ? "PUT" : "POST",
        body
      }),
      invalidatesTags: ["messages"]
    }),
    deleteMessageTemplate: builder.mutation<unknown, string>({
      query: id => ({
        url: `/api/v1/messaging/templates/${id}`,
        method: "DELETE"
      }),
      invalidatesTags: ["messages"]
    }),
    sendMessages: builder.mutation<{
      batch: MessageBatch;
    }, {
      requestId: string;
      channel: "sms" | "whatsapp";
      phones: string;
      message: string;
      contentSid?: string;
    }>({
      query: body => ({
        url: "/api/v1/messaging/send",
        method: "POST",
        body
      }),
      invalidatesTags: ["messages"]
    }),
    refundAlerts: builder.query<{
      alerts: RefundAlert[];
    }, string>({
      query: status => `/api/v1/payment/refund-alerts?status=${status}`,
      providesTags: ["refundAlerts"]
    }),
    resolveRefundAlert: builder.mutation<unknown, {
      id: string;
      refundReference: string;
      adminNote: string;
    }>({
      query: ({
        id,
        ...body
      }) => ({
        url: `/api/v1/payment/refund-alerts/${id}/resolve`,
        method: "PUT",
        body
      }),
      invalidatesTags: ["refundAlerts"]
    }),
    reconcilePayments: builder.mutation<{
      processed: number;
      failed: number;
      checked: number;
    }, void>({
      query: () => ({
        url: "/api/v1/payment/reconcile",
        method: "POST"
      }),
      invalidatesTags: ["refundAlerts"]
    })
  })
});
export const {
  useMessagingQuery,
  useSaveMessageTemplateMutation,
  useDeleteMessageTemplateMutation,
  useSendMessagesMutation,
  useRefundAlertsQuery,
  useResolveRefundAlertMutation,
  useReconcilePaymentsMutation
} = api;
