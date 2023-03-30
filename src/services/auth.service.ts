import { /* inject, */ BindingScope, injectable} from '@loopback/core';
import {repository} from '@loopback/repository';
import {HttpErrors} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {RolMenuRepository} from '../repositories';

@injectable({scope: BindingScope.TRANSIENT})
export class AuthService {
  constructor(
    @repository(RolMenuRepository)
    private repositorioRolMenu: RolMenuRepository
  ) { }

  async VerificarPermisoDeUsuarioPorRol(idRol: string, idMenu: string, accion: string): Promise<UserProfile | undefined> {
    let permiso = await this.repositorioRolMenu.findOne({
      where: {
        rolId: idRol,
        menuId: idMenu
      }
    });
    let continuar = false;
    if (permiso) {
      switch (accion) {
        case "guardar":
          continuar = permiso.guardar;
          break;
        case "editar":
          continuar = permiso.editar;
          break;
        case "listar":
          continuar = permiso.listar;
          break;
        case "eliminar":
          continuar = permiso.eliminar;
          break;
        case "descargar":
          continuar = permiso.descargar;
          break;

        default:
          throw new HttpErrors[401]("No es posible ejecutar la accion porque no existe");
      }
      if (continuar) {
        let perfil: UserProfile = Object.assign({  //Si retorma aqui está bien
          permitido: "ok"
        });
        return perfil;
      } else {
        return undefined; //Si retorna aqui es que algo ocurrio
      }
    } else {
      throw new HttpErrors[401]("No es posible ejecutar la accion por falta de permisos");
    }
  }
}
