import { AdminUser, BasicUser } from "@/src/lib/type";
import { apiUrl } from "@/src/lib/utils";
import { notFound } from "next/navigation";
import SendMailComponent from "./SendMailComponent";

interface SendMailProps {
  searchParams: {
    user_id?: string;
    is_admin?: string;
  };
}

const fetchUserInfo = async (
  userId: number,
  isAdmin: boolean
): Promise<Partial<BasicUser> | Partial<AdminUser> | null> => {
  try {
    const url = `${apiUrl}/api/${isAdmin ? "admin" : "basic-user"}/${userId}`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    return data.success
      ? {
          name: data.data.name,
          firstName: data.data.firstName,
          email: data.data.email,
        }
      : null;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function SendMailPage({ searchParams }: SendMailProps) {
  const userId = searchParams.user_id;
  const userIdFormated = Number(userId);
  const isAdmin = searchParams.is_admin === "true";

  if (!userId || isNaN(userIdFormated)) {
    notFound();
  }

  const user = await fetchUserInfo(userIdFormated, isAdmin);

  return (
    <div className="pb-6">
      <SendMailComponent user={user} />
    </div>
  );
}
