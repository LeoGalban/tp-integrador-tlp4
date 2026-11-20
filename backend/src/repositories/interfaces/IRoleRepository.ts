// Datos de un rol tal como los usa el resto de la aplicación
// (objetos simples: los services no necesitan conocer Sequelize)
export interface RoleData {
  id: number;
  name: string;
  permissions: string[]; // ej: ["producto:read", "subscription:create"]
}

// Contrato del repositorio de roles: QUÉ se puede hacer, no CÓMO
export interface IRoleRepository {
  findById(id: number): Promise<RoleData | null>;
  findByName(name: string): Promise<RoleData | null>;
  findAll(): Promise<RoleData[]>;
}
