MTApp

Multitenant Business Applications

https://www.youtube.com/playlist?list=PLkzo92owKnVx3Sh0nemX8GoSNzJGfsWJM

Philip's orgininal repo is at [https://github.com/saphanaacademy/MTApp](https://github.com/saphanaacademy/MTApp)
```
cf push MTAppBackend -n prov-multi-be -i 1 -k 256M -m 256M -p MTAppBackend
```

```
mkdir -p target
tools/set_nodejs_env
mta --build-target XSA --mtar target/mtapp-XSA.mtar build
```

Deploy the project (MASTER + CLIENT) and then add a client (ALPHA)
```
xs deploy target/mtapp-XSA.mtar -e deploy_to_prod.mtaext ; tools/add_client xs alpha v0 prod
```

Delete a client (ALPHA) then UnDeploy the project (MASTER + CLIENT)
```
tools/del_client xs alpha v0 prod ; xs undeploy dt_poc --delete-services -f
```
Enable the default CLIENT container.

```
cf update-service CLIENT_V0 -t "subdomain:prov-multi"
```
