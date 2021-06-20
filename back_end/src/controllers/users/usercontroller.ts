import { Router, Request, Response, NextFunction } from 'express';
import { NotFoundResponse, SuccessResponse } from '../../core/ApiResponse';
import asyncHandler from '../../core/asyncHandler';
import { ICreateOrganization, IOrganization, isOrganization } from '../../contracts/IOrganization';
import organizationService from '../../services/organizations/organizationsService';
import userService from '../../services/users/userservice';

const router = Router();

// router.get('/:u_name', async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         console.log(`Hit at baseUrl: ${req.baseUrl} originalUrl: ${req.originalUrl} url:${req.url} @ ${req.method}`);
//         const user_service = new userService();
//         const result = await user_service.getuserPassword(req.body.u_name);
//         // res.status(200).result[0].u_password;
//         if (result.length == 0) {
//             res.status(201).json({
//                 message: 'User Does not exits'
//             })
//         }
//         let pas1: string = req.body.u_password;
//         let pas2: string = result[0].u_password;
//         if (pas1 === pas2) {
//             res.status(200).json({
//                 message: 'Correct password'
//             })
//         }
//         else {
//             res.status(201).json({
//                 message: 'Wrong password'
//             })
//         }
//     }
//     catch (e) {
//         console.log(`Error occured in controller while geting details of password ${e}`);
//     }
// })

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user_service = new userService();
    let result = await user_service.login(req.body.u_name, req.body.u_password);
    if (result == true) {
      res.status(201).json({
        message: 'Auth Sucess'
      })
    }
    else {
      res.status(401).json({
        message: 'Auth Failed'
      })
    }
  }
  catch (e) {
    console.log(`Err: Cont: login  ${e}`);
    throw (e);
  }
})
router.get('/:u_name', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user_service = new userService();
    let u_name = req.params.u_name;
    let result = await user_service.userdetails(u_name);
    if (result.rowCount == 1) {
      res.status(200).json({
        message: "User details are",
        data: result.rows
      })
    }
    else {
      res.status(404).json({
        message: "Auth Failed"
      })
    }
  }
  catch (e) {
    console.log(`Err : Contro : userdetails ${e}`);
    res.status(404).json({ message: e.message })
  }
})

router.post('/signup', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user_service = new userService();
    let result = await user_service.createuser(req.body.u_name, req.body.u_password);
    if (result.rows.length == 1) {
      res.status(200).json({
        message: "User Already Exist",
      })
    }
    else {
      res.status(200).json({
        message: "New user created",
      })
    }
  }
  catch (e) {
    console.log(`Error : Contoller  :while creating  User ${e}`);
    res.status(404).json({
      e
    })
  }
})
router.put('/updatepassword', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user_service = new userService();
    let result = await user_service.updatepassword(req.body.u_name, req.body.u_password);
    if (result.rowCount == 1) {
      res.status(200).json({
        message: 'User password updated',
      })
    }
    else {
      res.status(300).json({
        message: 'Auth Failed',
      })
    }
  }
  catch (e) {
    console.log(`Error : Controller : UpadatePass  ${e}`);
    throw (e);
  }
});

router.delete('/deleteuser', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let user_service = new userService();
    let result = await user_service.deletuser(req.body.u_name);
    if (result.rowCount != 0) {
      res.status(200).json({
        message: "user deleted",
      })
    }
    else {
      res.status(200).json({
        message: "Auth Failed",
      })
    }
  }
  catch (e) {
    console.log(`Err: Contro:delete ${e}`);
    throw (e);
  }
})

// Org

router.get('/:u_id/orgs/:o_id', async (req: Request, res: Response) => {
  try {
    const orgSer = new organizationService();
    // TODO : Define new interface for non success states.
    const org: IOrganization | { message: string } = await orgSer.getOrganizationById(req.params.u_id, req.params.o_id);
    if (isOrganization(org)) {
      res.status(200).json({
        "status": "Success",
        "data": org
      });
    }
    else {
      res.status(200).json({
        "status": "Failure",
        "data": org
      });
    }
  } catch (error) {
    console.log(`Error for ${req.url} @ ${req.method} :${error}`)
    res.status(500).json({ "message": "Internal Server Error." });
  }

})

router.get('/:u_id/orgs', async (req: Request, res: Response) => {
  try {
    const orgSer = new organizationService();
    // TODO : Define new interface for non success states.
    const org: IOrganization[] | { message: string }[] = await orgSer.getOrganizationByUserId(req.params.u_id);
    if (isOrganization(org[0])) {
      new SuccessResponse('success', org).send(res);
    }
    else {
      new NotFoundResponse('No organizations found. Please check and try again.').send(res);
    }
  } catch (error) {
    console.log(`Error for ${req.url} @ ${req.method} :${error}`)
    res.status(500).json({ "message": "Internal Server Error." });
  }

})

router.post('/:u_id/orgs', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgSer = new organizationService();
    // TODO : Need to add validators.
    let newOrg: ICreateOrganization = {
      u_id: req.body.u_id,
      o_name: req.body.o_name,
      o_gst: req.body.o_gst,
      o_location: req.body.o_location
    }

    let createdOrg: IOrganization[] = await orgSer.createOrganization(newOrg);
    new SuccessResponse('success', createdOrg).send(res);

  } catch (error) {
    console.log(`Error for ${req.url} @ ${req.method} :${error}`);
    throw error;
  }

}))
export =router;