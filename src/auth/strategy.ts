import {AuthenticationBindings, AuthenticationMetadata, AuthenticationStrategy} from '@loopback/authentication';
import {inject, service} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import parseBearerToken from 'parse-bearer-token';
import {RolMenuRepository} from '../repositories';
import {AuthService, SeguridadUsuarioService} from '../services';

export class AuthStrategy implements AuthenticationStrategy {
  name: string = 'auth';

  constructor(
    @service(SeguridadUsuarioService)
    private servicioSeguridad: SeguridadUsuarioService,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata[],
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository,
    @service(AuthService)
    private servicioAuth: AuthService
  ) { }

  /**
   * Autenticacion de un usuario frente a una accion en la base de datos
   * @param request la solicitud con el token
   * @returns el perfin de usuario, undefined cuando no tiene permiso o un HttpError
   */
  async authenticate(request: Request): Promise<UserProfile | undefined> {
    //console.log("ejecutando estrategia");
    let token = parseBearerToken(request);
    if (token) {
      let idRol = this.servicioSeguridad.obtenerRolDesdeToken(token);
      let idMenu: string = this.metadata[0].options![0];
      let accion: string = this.metadata[0].options![1];

      console.log('rol', idRol, 'MENU', idMenu);
      try {
        let res = await this.servicioAuth.VerificarPermisoDeUsuarioPorRol(idRol, idMenu, accion);
        return res;
      } catch (e) {
        throw e;
      }
    }
    throw new HttpErrors[401]("No es posible ejecutar la accion por falta de un token");
  }
}
