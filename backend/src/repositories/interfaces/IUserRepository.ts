// Datos públicos de un usuario (nunca incluyen la contraseña)
export interface UserData {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  permissions: string[]; // permisos que le da su rol
}

// Igual que UserData pero con el hash de la contraseña.
// Solo lo necesita el login para comparar con bcrypt.
export interface UserWithPassword extends UserData {
  password: string;
}

// Datos necesarios para crear un usuario
export interface CreateUserData {
  name: string;
  email: string;
  password: string; // ya hasheada
  roleId: number;
}

// Contrato del repositorio de usuarios: QUÉ se puede hacer, no CÓMO
export interface IUserRepository {
  findById(id: number): Promise<UserData | null>;
  findByEmail(email: string): Promise<UserWithPassword | null>;
  findAll(): Promise<UserData[]>;
  create(data: CreateUserData): Promise<UserData>;
  updateRole(userId: number, roleId: number): Promise<UserData | null>;
}
