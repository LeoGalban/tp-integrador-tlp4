import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { HttpError } from "../errors/HttpError.ts";
import type { IUserRepository, UserData } from "../repositories/interfaces/IUserRepository.ts";
import type { IRoleRepository } from "../repositories/interfaces/IRoleRepository.ts";

// Rol que recibe todo usuario nuevo (RF2)
const DEFAULT_ROLE = "usuario";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Lo que devuelven registro y login: el token y los datos del usuario (sin contraseña)
export interface AuthResult {
  token: string;
  user: UserData;
}

// Lo que se guarda adentro del JWT
export interface TokenPayload {
  userId: number;
}

// Lógica de negocio de autenticación. No conoce Express (no recibe req ni res).
export class AuthService {
  private readonly userRepository: IUserRepository;
  private readonly roleRepository: IRoleRepository;
  private readonly jwtSecret: string;

  // Recibe sus dependencias por constructor: depende de INTERFACES, no de Sequelize
  constructor(userRepository: IUserRepository, roleRepository: IRoleRepository, jwtSecret: string) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.jwtSecret = jwtSecret;
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Ya existe un usuario con ese email");
    }

    const role = await this.roleRepository.findByName(DEFAULT_ROLE);
    if (!role) {
      throw new Error(`No existe el rol "${DEFAULT_ROLE}". ¿Se ejecutó el seed?`);
    }

    // La contraseña se guarda hasheada, nunca en texto plano
    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await this.userRepository.create({
      name: input.name.trim(),
      email,
      password: passwordHash,
      roleId: role.id,
    });

    return { token: this.createToken(user.id), user };
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const userWithPassword = await this.userRepository.findByEmail(email);

    // Mismo mensaje si no existe el email o si la contraseña está mal:
    // así no se revela qué emails están registrados
    const passwordOk =
      userWithPassword !== null && (await bcrypt.compare(input.password, userWithPassword.password));
    if (!userWithPassword || !passwordOk) {
      throw new HttpError(401, "Email o contraseña incorrectos");
    }

    // Se quita el hash antes de devolver el usuario
    const { password, ...user } = userWithPassword;
    return { token: this.createToken(user.id), user };
  }

  // Verifica un token y devuelve su contenido (lo va a usar el middleware authenticate)
  verifyToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      if (typeof payload === "string" || typeof payload.userId !== "number") {
        throw new Error("Payload inválido");
      }
      return { userId: payload.userId };
    } catch {
      throw new HttpError(401, "Token inválido o vencido");
    }
  }

  // A partir del token, devuelve el usuario con sus permisos ACTUALES.
  // Se busca en la base en cada request: si el admin le cambia el rol,
  // el cambio se aplica sin que el usuario tenga que volver a loguearse.
  async getUserFromToken(token: string): Promise<UserData> {
    const { userId } = this.verifyToken(token);
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new HttpError(401, "El usuario del token ya no existe");
    }
    return user;
  }

  private createToken(userId: number): string {
    const payload: TokenPayload = { userId };
    return jwt.sign(payload, this.jwtSecret, { expiresIn: "8h" });
  }
}
