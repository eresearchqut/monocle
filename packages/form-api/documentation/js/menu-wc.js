'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">form-api documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' : 'data-target="#xs-controllers-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' :
                                            'id="xs-controllers-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' }>
                                            <li class="link">
                                                <a href="controllers/AppController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' : 'data-target="#xs-injectables-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' :
                                        'id="xs-injectables-links-module-AppModule-4e85cf5c9b22eb364e8806432949ae7e5d27755d9476cf6e2845905c0ebc3845511c6de1bae7458b8b54f2e6f66f53b26ac12a88e12b3364a1f8f6feafae0f92"' }>
                                        <li class="link">
                                            <a href="injectables/AppService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuditModule.html" data-type="entity-link" >AuditModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' : 'data-target="#xs-controllers-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' :
                                            'id="xs-controllers-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' }>
                                            <li class="link">
                                                <a href="controllers/AuditController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' : 'data-target="#xs-injectables-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' :
                                        'id="xs-injectables-links-module-AuditModule-b8bb90638b2e95a863f8a9e4868de155265defb2f5922c6e149613dabd9a78a2bef566ba58f5b8c20ba5d2580ce9107371c5e816960dc45b219a64bc23e0ac37"' }>
                                        <li class="link">
                                            <a href="injectables/AuditService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuditService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/DynamodbModule.html" data-type="entity-link" >DynamodbModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-DynamodbModule-ee72421ee799bb120bd0690c0a4f28aa2147ffc7178335e4484c9f3d7e8aeef7dc21c1b8a476f2e3647215ca1f0db9f9f7cafe80dbdbd81696877742ad6b41aa"' : 'data-target="#xs-injectables-links-module-DynamodbModule-ee72421ee799bb120bd0690c0a4f28aa2147ffc7178335e4484c9f3d7e8aeef7dc21c1b8a476f2e3647215ca1f0db9f9f7cafe80dbdbd81696877742ad6b41aa"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DynamodbModule-ee72421ee799bb120bd0690c0a4f28aa2147ffc7178335e4484c9f3d7e8aeef7dc21c1b8a476f2e3647215ca1f0db9f9f7cafe80dbdbd81696877742ad6b41aa"' :
                                        'id="xs-injectables-links-module-DynamodbModule-ee72421ee799bb120bd0690c0a4f28aa2147ffc7178335e4484c9f3d7e8aeef7dc21c1b8a476f2e3647215ca1f0db9f9f7cafe80dbdbd81696877742ad6b41aa"' }>
                                        <li class="link">
                                            <a href="injectables/DynamodbService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DynamodbService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/MetadataModule.html" data-type="entity-link" >MetadataModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-MetadataModule-fdd35c5f3dc2a0eb905956c1015a5d689991add8677aa6bf444a5a4d4cb5690d234dd28eb535fab2a8869c83e9debb09d716da5577145f86b344ad628bc7984b"' : 'data-target="#xs-injectables-links-module-MetadataModule-fdd35c5f3dc2a0eb905956c1015a5d689991add8677aa6bf444a5a4d4cb5690d234dd28eb535fab2a8869c83e9debb09d716da5577145f86b344ad628bc7984b"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-MetadataModule-fdd35c5f3dc2a0eb905956c1015a5d689991add8677aa6bf444a5a4d4cb5690d234dd28eb535fab2a8869c83e9debb09d716da5577145f86b344ad628bc7984b"' :
                                        'id="xs-injectables-links-module-MetadataModule-fdd35c5f3dc2a0eb905956c1015a5d689991add8677aa6bf444a5a4d4cb5690d234dd28eb535fab2a8869c83e9debb09d716da5577145f86b344ad628bc7984b"' }>
                                        <li class="link">
                                            <a href="injectables/MetadataService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetadataService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/OldResourceModule.html" data-type="entity-link" >OldResourceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' : 'data-target="#xs-controllers-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' :
                                            'id="xs-controllers-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' }>
                                            <li class="link">
                                                <a href="controllers/OldResourceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OldResourceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' : 'data-target="#xs-injectables-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' :
                                        'id="xs-injectables-links-module-OldResourceModule-70ad51dc35888f12b3eaff9da1e1325615a8175cad8e41a0e14f4c6f38253e114d02f9551f47f01b4e11416e2311df73e94bca75394bf9fe5d5ae01ac36cbdc3"' }>
                                        <li class="link">
                                            <a href="injectables/OldResourceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OldResourceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/PatientModule.html" data-type="entity-link" >PatientModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' : 'data-target="#xs-controllers-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' :
                                            'id="xs-controllers-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' }>
                                            <li class="link">
                                                <a href="controllers/PatientController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PatientController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' : 'data-target="#xs-injectables-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' :
                                        'id="xs-injectables-links-module-PatientModule-7d245e1d929e18f3bc6d94a361083b6ba1d2b8626f7c7b0f6c6f58568deeae102058b8b82d260a2c4a1af949def1a8608b546c7f57a9b2afec4b612d9e99b39d"' }>
                                        <li class="link">
                                            <a href="injectables/PatientService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PatientService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/ResourceModule.html" data-type="entity-link" >ResourceModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#controllers-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' : 'data-target="#xs-controllers-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' }>
                                            <span class="icon ion-md-swap"></span>
                                            <span>Controllers</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="controllers-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' :
                                            'id="xs-controllers-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' }>
                                            <li class="link">
                                                <a href="controllers/ResourceController.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResourceController</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' : 'data-target="#xs-injectables-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' :
                                        'id="xs-injectables-links-module-ResourceModule-2ed010c0a4bfb34820afef82e9a0208fdae9bdc9875f543cb97f346e912e13800ab1543e0a6db867eaea5c0f8de4dc8cf882e608bdd3508310d04e5b65d02d90"' }>
                                        <li class="link">
                                            <a href="injectables/ResourceService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResourceService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/SchemaModule.html" data-type="entity-link" >SchemaModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/AbstractResource.html" data-type="entity-link" >AbstractResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/AddPatientDto.html" data-type="entity-link" >AddPatientDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/AppConfig.html" data-type="entity-link" >AppConfig</a>
                            </li>
                            <li class="link">
                                <a href="classes/ConditionException.html" data-type="entity-link" >ConditionException</a>
                            </li>
                            <li class="link">
                                <a href="classes/DataResourceParams.html" data-type="entity-link" >DataResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteResourceData.html" data-type="entity-link" >DeleteResourceData</a>
                            </li>
                            <li class="link">
                                <a href="classes/DeleteResourceParams.html" data-type="entity-link" >DeleteResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/FormTransactionInterceptor.html" data-type="entity-link" >FormTransactionInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientDto.html" data-type="entity-link" >GetPatientDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientDto-1.html" data-type="entity-link" >GetPatientDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientFormDto.html" data-type="entity-link" >GetPatientFormDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientFormDto-1.html" data-type="entity-link" >GetPatientFormDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientFormLongitudinalHistory.html" data-type="entity-link" >GetPatientFormLongitudinalHistory</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientFormsDto.html" data-type="entity-link" >GetPatientFormsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientsDto.html" data-type="entity-link" >GetPatientsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetPatientsDto-1.html" data-type="entity-link" >GetPatientsDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetResourceData.html" data-type="entity-link" >GetResourceData</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetResourceParams.html" data-type="entity-link" >GetResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/GetResourceParams-1.html" data-type="entity-link" >GetResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/GroupMetadata.html" data-type="entity-link" >GroupMetadata</a>
                            </li>
                            <li class="link">
                                <a href="classes/ItemEntity.html" data-type="entity-link" >ItemEntity</a>
                            </li>
                            <li class="link">
                                <a href="classes/ItemEntityClass.html" data-type="entity-link" >ItemEntityClass</a>
                            </li>
                            <li class="link">
                                <a href="classes/Metadata.html" data-type="entity-link" >Metadata</a>
                            </li>
                            <li class="link">
                                <a href="classes/MetadataAuthorization.html" data-type="entity-link" >MetadataAuthorization</a>
                            </li>
                            <li class="link">
                                <a href="classes/MetadataException.html" data-type="entity-link" >MetadataException</a>
                            </li>
                            <li class="link">
                                <a href="classes/MetadataForm.html" data-type="entity-link" >MetadataForm</a>
                            </li>
                            <li class="link">
                                <a href="classes/OldResourceDto.html" data-type="entity-link" >OldResourceDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/OptionallyVersionedResourceParams.html" data-type="entity-link" >OptionallyVersionedResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/PatientFormResource.html" data-type="entity-link" >PatientFormResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/PatientResource.html" data-type="entity-link" >PatientResource</a>
                            </li>
                            <li class="link">
                                <a href="classes/PostResourceData.html" data-type="entity-link" >PostResourceData</a>
                            </li>
                            <li class="link">
                                <a href="classes/PostResourceParams.html" data-type="entity-link" >PostResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutResourceData.html" data-type="entity-link" >PutResourceData</a>
                            </li>
                            <li class="link">
                                <a href="classes/PutResourceParams.html" data-type="entity-link" >PutResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/Registry.html" data-type="entity-link" >Registry</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegistryPatient.html" data-type="entity-link" >RegistryPatient</a>
                            </li>
                            <li class="link">
                                <a href="classes/RegistryPatientForm.html" data-type="entity-link" >RegistryPatientForm</a>
                            </li>
                            <li class="link">
                                <a href="classes/ResourceParams.html" data-type="entity-link" >ResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="classes/SavePatientFormDto.html" data-type="entity-link" >SavePatientFormDto</a>
                            </li>
                            <li class="link">
                                <a href="classes/UserResource.html" data-type="entity-link" >UserResource</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/VersionErrorInterceptor.html" data-type="entity-link" >VersionErrorInterceptor</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AuditFields.html" data-type="entity-link" >AuditFields</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CommonEntity.html" data-type="entity-link" >CommonEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DeleteResourceInput.html" data-type="entity-link" >DeleteResourceInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GetResourceInput.html" data-type="entity-link" >GetResourceInput</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/getResourceParams.html" data-type="entity-link" >getResourceParams</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemEntity.html" data-type="entity-link" >ItemEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PatientEntity.html" data-type="entity-link" >PatientEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PatientFormEntity.html" data-type="entity-link" >PatientFormEntity</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProvenancedDataItem.html" data-type="entity-link" >ProvenancedDataItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PutResourceInput.html" data-type="entity-link" >PutResourceInput</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});