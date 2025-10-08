import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import convertToSubcurrency from "@/src/lib/convertToSubcurrency";
import { Button } from "@/src/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useGlobalStore } from "@/src/store/useGlobalStore";

export default function CheckoutPage({
  amount,
  verifyForm,
  onPaymentResult,
}: {
  amount: number;
  verifyForm: () => Promise<boolean>;
  onPaymentResult: (
    success: boolean,
    paymentId?: string,
    error?: string
  ) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [paymentElementReady, setPaymentElementReady] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string>();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const setIsGeneralLoadingVisible = useGlobalStore(
    (state) => state.setIsGeneralLoadingVisible
  );

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isValid = await verifyForm();
    if (!isValid) return;

    setLoading(true);
    setIsGeneralLoadingVisible(true);

    if (!stripe || !elements) return;

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      onPaymentResult(false, submitError.message);
      setLoading(false);
      setIsGeneralLoadingVisible(false);
      return;
    }

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message);
      onPaymentResult(false, error.message);
      setLoading(false);
      setIsGeneralLoadingVisible(false);
      window.location.reload();
      return;
    }

    if (paymentIntent && paymentIntent.status === "succeeded") {
      onPaymentResult(true, paymentIntent.id);
    } else {
      onPaymentResult(false, "Le paiement n'a pas pu être confirmé.");
      setIsGeneralLoadingVisible(false);
      setLoading(false);
      window.location.reload();
    }
  };

  if (!clientSecret || !stripe || !elements) {
    return (
      <div className="w-full text-cPrimary flex gap-2 items-center justify-center">
        <LoaderCircle className="animate-spin" />
        Chargement en cours...
      </div>
    );
  }
  return (
    <form onSubmit={handleSubmit}>
      {clientSecret && (
        <PaymentElement  onReady={() => setPaymentElementReady(true)} />
      )}
      {errorMessage && (
        <div className="text-sm pt-2 text-red-500">{errorMessage}</div>
      )}
      {clientSecret && (
        <Button
          disabled={!stripe || !paymentElementReady || loading}
          type="submit"
          variant={"ghost"}
          className=" w-full bg-cPrimary text-cForeground hover:text-cForeground hover:bg-cPrimaryHover text-lg font-semibold mt-6 disabled:opacity-50 disabled:hover:bg-cPrimary"
        >
          {!loading ? "Payer maintenant" : "Traitement en cours..."}
        </Button>
      )}
    </form>
  );
}
