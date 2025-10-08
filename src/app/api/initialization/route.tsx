// A EXECUTER SEULEMENT AU DEBUT DU PROJET POUR INITIALISER LA BASE DE DONNEE

import pool from "@/src/lib/db";
import { ResultSetHeader } from "mysql2/promise";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const insertQuery = `
      INSERT INTO sub_role (label) VALUES (?)
    `;

    const roles = ["admin", "manager"];
    const insertedIds: number[] = [];

    for (const role of roles) {
      const [result] = await pool.execute<ResultSetHeader>(insertQuery, [role]);
      insertedIds.push(result.insertId);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Rôles insérés avec succès",
        insertedIds,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Erreur lors de l'initialisation :", error);
    return NextResponse.json(
      { success: false, message: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
