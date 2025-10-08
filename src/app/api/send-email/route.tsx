import React from "react";
import { NextResponse } from "next/server";
import { sendEmail } from "@/src/lib/mailer";
import { render } from "@react-email/render";
import NotifUserForBookingOffice from "@/src/emails/NotifUserForBookingOffice";
import NotifUserForVirtualOffice from "@/src/emails/NotifUserForVirtualOffice";

export async function POST(req: Request) {
  const { to, subject, dataForEmail, typeOfService } = await req.json();

  let html;

  if(typeOfService === "virtual-office-offer") {
    html = await render(
      React.createElement(NotifUserForVirtualOffice, dataForEmail)
    )
  } else {
    html = await render(
      React.createElement(NotifUserForBookingOffice, dataForEmail)
    );
  }
  
  try {
    await sendEmail({ to, subject, html });
    return NextResponse.json({ message: "Email sent successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to send email", error },
      { status: 500 }
    );
  }
}
