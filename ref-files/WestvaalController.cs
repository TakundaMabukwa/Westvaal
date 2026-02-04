using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using API.Helpers;
using API.Utility;
using DapperCrud;
using DinkToPdf;
using DinkToPdf.Contracts;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Repository;

namespace API.Controllers;

[Authorize]
[Route("api/[action]")]
public class WestvaalController(IConverter _converter) : ControllerBase<BaseRepository>
{
    [HttpPost]
    public async Task<Mmdto> CreateNewMM([FromBody] Mmdto req)
    {
        using var u = UnitOfWork();
        var result = new Mmdto
        {
            BasicVehicleInformation = await u.Repository.Insert(req.BasicVehicleInformation),
            Specifications = await u.Repository.Insert(req.Specifications),
            Finance = await u.Repository.Insert(req.Finance),
            Warranty = await u.Repository.Insert(req.Warranty),
            AdditionalFeatures = await u.Repository.Insert(req.AdditionalFeatures)
        };
        return result;
    }

    [HttpGet]
    public async Task<IEnumerable<BasicVehicleInformation>> GetAllBasicVehicleInformation()
    {
        using var u = UnitOfWork();
        return await u.Repository.FindAll<BasicVehicleInformation>();
    }

    [HttpGet]
    public async Task<Mmdto> GetMM([FromQuery] string mmCode)
    {
        using var u = UnitOfWork();
        var data = new Mmdto
        {
            BasicVehicleInformation = await u.Repository.FindOne<BasicVehicleInformation>(mmCode),
            Finance =await u.Repository.FindOne<Finance>(mmCode),
            Warranty =await u.Repository.FindOne<Warranty>(mmCode),
            Specifications =await u.Repository.FindOne<Specifications>(mmCode),
            AdditionalFeatures =await u.Repository.FindOne<AdditionalFeatures>(mmCode) 
        };



        return data;
    }

    [HttpGet]
    public async Task<IEnumerable<Mmdto>> GetMMs()
    {
        using var u = UnitOfWork();
        var bvi = await u.Repository.FindAll<BasicVehicleInformation>();
        var s = await u.Repository.FindAll<Specifications>();
        var f = await u.Repository.FindAll<Finance>();
        var w = await u.Repository.FindAll<Warranty>();
        var a = await u.Repository.FindAll<AdditionalFeatures>();
        return bvi.Select(x => new Mmdto
        {
            Specifications = s.FirstOrDefault(specifications => specifications.MmCode == x.MmCode),
            Finance = f.FirstOrDefault(finance => finance.MmCode == x.MmCode),
            Warranty = w.FirstOrDefault(warranty => warranty.MmCode == x.MmCode),
            AdditionalFeatures = a.FirstOrDefault(q => q.MmCode == x.MmCode),
            BasicVehicleInformation = x
        });
    }

    [HttpGet]
    public async Task<IEnumerable<AccessoriesView>> Accessories()
    {
        using var u = UnitOfWork();
        return await u.Repository.FindAll<AccessoriesView>();
    }

    [HttpPost]
    public async Task<Accessories> Accessories([FromBody] Accessories accessory)
    {
        using var u = UnitOfWork();
        return await u.Repository.Insert(accessory);
    }

    [HttpPut("{id:int}")]
    public async Task<Accessories> Accessories(int id, [FromBody] Accessories accessory)
    {
        using var u = UnitOfWork();

        if (id != accessory.Id) throw new BadHttpRequestException("ID mismatch");

        var update = await u.Repository.FindOne<Accessories>(id);

        if (update == null)
            throw new BadHttpRequestException($"Accessory with Id = {id} not found");

        return await u.Repository.Update(accessory);
    }


    [HttpDelete("{id:int}")]
    public async Task<int> Accessories(int id)
    {
        using var u = UnitOfWork();
        return await u.Repository.RemoveOne<Accessories>(id);
    }

    [HttpPost]
    public async Task<WestvaalClient> WestvaalClient([FromBody] WestvaalClient westvaalClient)
    {
        using var u = UnitOfWork();
        var client = new WestvaalClient();
        westvaalClient.PhysicalAddress.AddressTypeId = 1;
        client.PhysicalAddress = await u.Repository.Insert(westvaalClient.PhysicalAddress);
        if (null != westvaalClient.PostalAddress)
        {
            westvaalClient.PostalAddress.AddressTypeId = 2;
            client.PostalAddress = await u.Repository.Insert(westvaalClient.PostalAddress);
        }

        var fleetIds = new List<int>();
        foreach (var fleet in westvaalClient.FleetSizeInformation)
        {
            var res = await u.Repository.Insert(fleet);
            fleetIds.Add(res.Id);
        }

        // client.FleetSizeInformation = await u.Repository.InsertEntityAsyncList();
        client.BusinessTypes = await u.Repository.Insert(westvaalClient.BusinessTypes);
        // client.ContactDetails = await u.Repository.InsertEntityAsyncList(westvaalClient.ContactDetails);
        var contactIds = new List<int>();
        foreach (var fleet in westvaalClient.ContactDetails)
        {
            var res = await u.Repository.Insert(fleet);
            contactIds.Add(res.Id);
        }

        client.CompanyInformation = await u.Repository.Insert(westvaalClient.CompanyInformation);
        await u.Repository.Insert(new ClientRegistration
        {
            CompanyId = client.CompanyInformation.Id,
            FleetSizeInformationId = fleetIds.ToArray(),
            BusinessTypeId = client.BusinessTypes.Id,
            ContactDetailsId = contactIds.ToArray(),
            PhysicalAddressId = client.PhysicalAddress.Id,
            PostalAddressId = client.PostalAddress?.Id ?? client.PhysicalAddress.Id
        });
        return client;
    }

    [HttpPut("{id:int}")]
    public async Task<WestvaalClient> WestvaalClient(int id, [FromBody] WestvaalClient westvaalClient)
    {
        using var u = UnitOfWork();
        var client = new WestvaalClient();
        westvaalClient.PhysicalAddress.AddressTypeId = 1;
        client.PhysicalAddress = await u.Repository.Update(westvaalClient.PhysicalAddress);
        if (null != westvaalClient.PostalAddress)
        {
            westvaalClient.PostalAddress.AddressTypeId = 2;
            if (westvaalClient.PostalAddress.Id == default)
                client.PostalAddress = await u.Repository.Insert(westvaalClient.PostalAddress);
            else
                client.PostalAddress = await u.Repository.Update(westvaalClient.PostalAddress);
        }

        client.FleetSizeInformation = await u.Repository.UpdateAsyncList(westvaalClient.FleetSizeInformation);
        client.BusinessTypes = await u.Repository.Update(westvaalClient.BusinessTypes);
        client.ContactDetails = await u.Repository.UpdateAsyncList(westvaalClient.ContactDetails);
        client.CompanyInformation = await u.Repository.Update(westvaalClient.CompanyInformation);

        return client;
    }

    [HttpGet]
    public async Task<IEnumerable<CompanyInformation>> CompanyInformation()
    {
        using var u = UnitOfWork();
        return await u.Repository.FindAll<CompanyInformation>();
    }

    [HttpGet]
    public async Task<IEnumerable<WestvaalClient>> WestvaalClient()
    {
        using var u = UnitOfWork();
        var results = await u.Repository.ExecuteSql<WestvaalClientJson>("""
                                                                        select
                                                                                 	json_build_object('id',
                                                                                 	ci.id,
                                                                                 	'companyname',
                                                                                 	ci.company_name,
                                                                                 	'registrationnumber',
                                                                                 	ci.registration_number,
                                                                                 	'vatnumber',
                                                                                 	ci.vat_number) as CompanyInformation,
                                                                                 	json_build_object(
                                                                                 	'id',
                                                                                 	bt.id,
                                                                                 	'isconstruction',
                                                                                 	bt.is_construction,
                                                                                 	'iscourier',
                                                                                 	bt.is_courier,
                                                                                 	'isfarming',
                                                                                 	bt.is_farming,
                                                                                 	'isforestry',
                                                                                 	bt.is_forestry,
                                                                                 	'ismanufacturing',
                                                                                 	bt.is_manufacturing,
                                                                                 	'ismining',
                                                                                 	bt.is_mining,
                                                                                 	'ismunicipality',
                                                                                 	bt.is_municipality,
                                                                                 	'isrental',
                                                                                 	bt.is_rental,
                                                                                 	'issecurity',
                                                                                 	bt.is_security,
                                                                                 	'issmall_business',
                                                                                 	bt.is_small_business,
                                                                                 	'istransport',
                                                                                 	bt.is_transport,
                                                                                 	'iswholesale',
                                                                                 	bt.is_wholesale,
                                                                                 	'isother',
                                                                                 	bt.is_other,
                                                                                 	'other',
                                                                                 	bt.other) as BusinessTypes,
                                                                                 	json_build_object('id',
                                                                                 	cd.id,
                                                                                 	'firstname',
                                                                                 	cd.first_name,
                                                                                 	'surname',
                                                                                 	cd.surname,
                                                                                 	'primarycontactnumber',
                                                                                 	cd.primary_contact_number,
                                                                                 	'emailaddress',
                                                                                 	cd.email_address,
                                                                                 	'alternativecontactnumber',
                                                                                 	cd.alternative_contact_number,
                                                                                 	'identificationnumber',
                                                                                 	cd.identification_number,
                                                                                 	'positionid',
                                                                                 	cd.position_id)as ContactDetails,
                                                                                 	json_build_object('id',
                                                                                 	phy.id,
                                                                                 	'address',
                                                                                 	phy.address,
                                                                                 	'lat',
                                                                                 	phy.lat,
                                                                                 	'lng',
                                                                                 	phy.lng,
                                                                                 	'addresstypeid',
                                                                                 	phy.address_type_id)as PhysicalAddress,
                                                                                 	json_build_object('id',
                                                                                 	pos.id,
                                                                                 	'address',
                                                                                 	pos.address,
                                                                                 	'lat',
                                                                                 	pos.lat,
                                                                                 	'lng',
                                                                                 	pos.lng,
                                                                                 	'addresstypeid',
                                                                                 	pos.address_type_id)as PostalAddress,
                                                                                 	json_build_object(
                                                                                 'id',	fsi.id,
                                                                                 'makeid',	fsi.make_id,
                                                                        			'vehicletypeid',fsi.vehicle_type_id,
                                                                        			'numberofvehicles',fsi.number_of_vehicles,
                                                                                 'replacementeverykm',	fsi.replacement_every_km,
                                                                                 'replacementeverymonths',	fsi.replacement_every_months)as FleetSizeInformation
                                                                                 from
                                                                                 	westvaal.client_registration r
                                                                                 join westvaal.company_information ci on
                                                                                 	ci.id = r.company_id
                                                                                 join westvaal.business_types bt on
                                                                                 	bt.id = r.business_type_id
                                                                                 join westvaal.contact_details cd on
                                                                                 	cd.id = any(r.contact_details_id)
                                                                                 join westvaal.geo_address phy on
                                                                                 	phy.id = r.physical_address_id
                                                                                 join westvaal.geo_address pos on
                                                                                 	pos.id = r.postal_address_id
                                                                                 join westvaal.fleet_size_information fsi on
                                                                                 	fsi.id = any(r.fleet_size_information_id)
                                                                        """);
        var list = results.ToList();
        var dis = new Dictionary<int, WestvaalClient>();
        foreach (var l in list)
        {
            var contactDetails = l.ContactDetails.Value;
            var businessTypes = l.BusinessTypes.Value;
            var physicalAddress = l.PhysicalAddress.Value;
            var postalAddress = l.PostalAddress.Value;
            var companyInformation = l.CompanyInformation.Value;
            var fleetSizeInformation = l.FleetSizeInformation.Value;
            if (companyInformation != null && dis.ContainsKey(companyInformation.Id))
            {
                dis.TryGetValue(companyInformation.Id, out var data);
                var a = data.FleetSizeInformation.ToList();
                var c = data.ContactDetails.ToList();
                if (data != null && !data.FleetSizeInformation.ToDictionary(x => x.Id)
                        .ContainsKey(fleetSizeInformation.Id))
                    a.Add(fleetSizeInformation);

                if (data != null && !data.ContactDetails.ToDictionary(x => x.Id).ContainsKey(contactDetails.Id))
                    c.Add(contactDetails);

                dis.Remove(companyInformation.Id);
                dis.Add(companyInformation.Id, new WestvaalClient
                {
                    FleetSizeInformation = a,
                    BusinessTypes = businessTypes,
                    CompanyInformation = companyInformation,
                    ContactDetails = c,
                    PhysicalAddress = physicalAddress,
                    PostalAddress = postalAddress
                });
            }
            else
            {
                dis.Add(companyInformation.Id, new WestvaalClient
                {
                    FleetSizeInformation = new List<FleetSizeInformation>(new[] { fleetSizeInformation }),
                    ContactDetails = new List<ContactDetailsWestvaal>(new[] { contactDetails }),
                    BusinessTypes = businessTypes,
                    CompanyInformation = companyInformation,
                    PhysicalAddress = physicalAddress,
                    PostalAddress = postalAddress
                });
            }
        }

        return dis.Select(x => x.Value);
    }

    [HttpGet]
    public async Task<WestvaalClient> WestvaalClientById([FromQuery] int id)
    {
        if (0 == id) return new WestvaalClient();
        using var u = UnitOfWork();
        var reglist = await u.Repository.Find(new ClientRegistration { CompanyId = id });
        var reg = reglist.FirstOrDefault();
        var companyInformation = await u.Repository.FindOne<CompanyInformation>(reg.CompanyId);
        var businessTypes = await u.Repository.FindOne<BusinessTypes>(reg.BusinessTypeId);
        var physicalAddress = await u.Repository.FindOne<GeoAddress>(reg.PhysicalAddressId);
        var postalAddress = await u.Repository.FindOne<GeoAddress>(reg.PostalAddressId);
        var contactDetails = await u.Repository.FindAllBy<ContactDetailsWestvaal>(new { id = reg.ContactDetailsId });
        var fleetSizeInformation =
            await u.Repository.FindAllBy<FleetSizeInformation>(new { id = reg.FleetSizeInformationId });
        return new WestvaalClient
        {
            CompanyInformation = companyInformation,
            BusinessTypes = businessTypes,
            PhysicalAddress = physicalAddress,
            PostalAddress = postalAddress,
            ContactDetails = contactDetails,
            FleetSizeInformation = fleetSizeInformation
        };
    }

    [HttpPost]
    public async Task<CrateStoreItem> CrateStoreItem([FromBody] CrateStoreItem crateStoreItem)
    {
        using var u = UnitOfWork();
        var s = await u.Repository.Insert(crateStoreItem.WestVaalStore);
        var q = await u.Repository.InsertEntityAsyncList(crateStoreItem.WestVaalStoreImages.Select(x =>
            new WestVaalStoreImages
            {
                image = x.image,
                Name = x.Name,
                Id = s.Id
            }));
        return new CrateStoreItem
        {
            WestVaalStore = s,
            WestVaalStoreImages = q
        };
    }

    [HttpGet]
    public async Task<IEnumerable<WestVaalStore>> StoreItem()
    {
        using var u = UnitOfWork();
        return await u.Repository.FindAll<WestVaalStore>();
    }

    [HttpGet("{id:int}")]
    public async Task<IEnumerable<WestVaalStoreImages>> StoreItemImages(int id)
    {
        using var u = UnitOfWork();
        return await u.Repository.ExecuteSql<WestVaalStoreImages>("""
                                                                  select id, "name", image  from westvaal.store_images si where id = @id
                                                                  """, new { id });
    }

    [HttpPost]
    [Produces("application/octet-stream", "text/json")]
    [ProducesResponseType(typeof(FileStreamResult), (int)HttpStatusCode.OK)]
    public async Task<FileContentResult> PreviewQuote([FromBody] WestvaalQuote quote)
    {
        var s = await TemplateGenerator.GetHtmlStringQuoteWestvaal(quote);
        var globalSettings = new GlobalSettings
        {
            ColorMode = ColorMode.Color,
            Orientation = Orientation.Portrait,
            PaperSize = PaperKind.A4,
            ImageDPI = 1200,
            // Margins = new MarginSettings {Top = 0, Left = 0, Right = 0},
            DocumentTitle = "PDF Quote"
            // Out = @$"/var/uploaded/{document.Id}"
        };
        var objectSettings = new ObjectSettings
        {
            PagesCount = true,
            HtmlContent = s,
            WebSettings =
            {
                DefaultEncoding = "utf-8",
                UserStyleSheet = Path.Combine(Directory.GetCurrentDirectory(), "assets", "quote.css"),
                enablePlugins = true
            }
            // HeaderSettings = { FontName = "Arial", FontSize = 9, Line = false },
        };
        var pdf = new HtmlToPdfDocument
        {
            GlobalSettings = globalSettings,
            Objects = { objectSettings }
        };

        var bytes = _converter.Convert(pdf);
        return File(bytes, "application/pdf", "cash.pdf");
    }

    [HttpPost]
    public async Task<QuoteJson> SaveQuote([FromBody] WestvaalQuote quote)
    {
        using var u = UnitOfWork();

        return await u.Repository.Insert(new QuoteJson
        {
            Json = JsonConvert.SerializeObject(quote)
        });
    }

    [HttpGet]
    public async Task<IEnumerable<QuoteJson>> GetQuotes()
    {
        using var u = UnitOfWork();
        return await u.Repository.FindAll<QuoteJson>();
    }

    [HttpGet]
    public async Task<IEnumerable<FleetAssist>> FleetAssist()
    {
        using var u = UnitOfWork();
        return await u.Repository.FindAll<FleetAssist>();
    }

    [HttpPost]
    public async Task<FleetAssist> FleetAssist([FromBody] FleetAssist fleetAssist)
    {
        using var u = UnitOfWork();
        if (fleetAssist.Id != default) return await u.Repository.Update(fleetAssist);
        return await u.Repository.Insert(fleetAssist);
    }

    [HttpPut]
    public async Task<FleetAssist> UpdateFleetAssist([FromBody] FleetAssist fleetAssist)
    {
        using var u = UnitOfWork();
        return await u.Repository.Update(fleetAssist);
    }

    [HttpPut]
    public async Task<QuoteJson> ChangeStatus([FromQuery] int id, string status)
    {
        using var u = UnitOfWork();
        var s = await u.Repository.FindOne<QuoteJson>(id);
        var p = JsonConvert.DeserializeObject<WestvaalQuote>(s.Json);
        p.status = status;
        return await u.Repository.Update(new QuoteJson
        {
            Id = id,
            Json = JsonConvert.SerializeObject(p)
        });
    }

    [HttpPut]
    public async Task<QuoteJson> ClientApproved([FromQuery] int id)
    {
        using var u = UnitOfWork();
        var s = await u.Repository.FindOne<QuoteJson>(id);
        var p = JsonConvert.DeserializeObject<WestvaalQuote>(s.Json);
        p.status = "Client Approved";
        return await u.Repository.Update(new QuoteJson
        {
            Id = id,
            Json = JsonConvert.SerializeObject(p)
        });
    }

    [HttpPut]
    public async Task<QuoteJson> SentToBank([FromQuery] int id, [FromQuery] string bankRef)
    {
        using var u = UnitOfWork();
        var s = await u.Repository.FindOne<QuoteJson>(id);
        var p = JsonConvert.DeserializeObject<WestvaalQuote>(s.Json);
        p.status = "Awaiting Bank Ref";
        p.bankRef = bankRef;

        return await u.Repository.Update(new QuoteJson
        {
            Id = id,
            Json = JsonConvert.SerializeObject(p)
        });
    }

    [HttpPut]
    public async Task<QuoteJson> UpdateBankReg([FromQuery] int id, [FromQuery] string bankRef)
    {
        using var u = UnitOfWork();
        var s = await u.Repository.FindOne<QuoteJson>(id);
        var p = JsonConvert.DeserializeObject<WestvaalQuote>(s.Json);
        p.status = "Awaiting Inspection";
        p.bankRef = bankRef;
        return await u.Repository.Update(new QuoteJson
        {
            Id = id,
            Json = JsonConvert.SerializeObject(p)
        });
    }
}

[DapperCrud.Attributes.Table("quote_json", Schema = "westvaal")]
public class QuoteJson
{
    [IgnoreInsert] [Column("id")] public int Id { get; set; }
    [Column("json")] public string Json { get; set; }
}

// Root myDeserializedClass = JsonConvert.DeserializeObject<Root>(myJsonResponse);
public class DtoAccessory
{
    public int quantity { get; set; }
    public decimal masterPrice { get; set; }
    public decimal masterDiscount { get; set; }
    public decimal price { get; set; }
    public DtoProduct product { get; set; }
}

public class DtoAdditionalFeatures
{
    public string mmCode { get; set; }
    public bool hasAbs { get; set; }
    public bool hasAirbags { get; set; }
    public bool hasAircon { get; set; }
    public bool hasAlloyWheels { get; set; }
    public bool hasCruiseControl { get; set; }
    public bool hasDiffLock { get; set; }
    public bool hasElectricWindows { get; set; }
    public bool hasLowRatio { get; set; }
    public bool hasPdc { get; set; }
    public bool hasPowerSteering { get; set; }
    public bool hasSatNav { get; set; }
    public bool hasSecurity { get; set; }
    public bool hasTraction { get; set; }
}

public class DtoBasicVehicleInformation
{
    public string mmCode { get; set; }
    public string make { get; set; }
    public string model { get; set; }
    public string type { get; set; }
}

public class DtoCustomerDetails
{
    public string quoteTo { get; set; }
    public string companyName { get; set; }
    public string emailAddress { get; set; }
    public string contactNumber { get; set; }
}

public class DtoEmail
{
    public string footer { get; set; }
    public string subject { get; set; }
    public string body { get; set; }
}

public class DtoFinance
{
    public string mmCode { get; set; }
    public int financePerMonth { get; set; }
    public int rv { get; set; }
    public int rvPercentage { get; set; }
    public int totalFinance { get; set; }
    public int resale { get; set; }
    public int maintenance { get; set; }
    public int tyres { get; set; }
    public int fuel { get; set; }
    public int insurance { get; set; }
    public int operatingCostPerMonth { get; set; }
    public int operatingCostPerKilometre { get; set; }
    public int totalCostPerMonth { get; set; }
    public int totalCostPerKilometre { get; set; }
    public int totalCostOverall { get; set; }
}

public class DtoPart
{
    public int quantity { get; set; }
    public decimal masterPrice { get; set; }
    public decimal masterDiscount { get; set; }
    public decimal price { get; set; }
    public List<DtoAccessory> accessories { get; set; }
    // public List<DtoAccessory> addedProducts { get; set; }
    public DtoProduct product { get; set; }
}

public class DtoProduct
{
    public int id { get; set; }
    public string mmCode { get; set; }
    public string name { get; set; }
    public string description { get; set; }
    public decimal cost { get; set; }
    public decimal retail { get; set; }
    public decimal maxDiscount { get; set; }
    public bool isActive { get; set; }
    public DtoBasicVehicleInformation basicVehicleInformation { get; set; }
    public DtoSpecifications specifications { get; set; }
    public DtoFinance finance { get; set; }
    public DtoWarranty warranty { get; set; }
    public DtoAdditionalFeatures additionalFeatures { get; set; }
}

public class WestvaalQuote
{
    public List<DtoPart> parts { get; set; }
    public DtoCustomerDetails customerDetails { get; set; }
    public DtoEmail email { get; set; }
    public string status { get; set; }
    public string bankRef { get; set; }
}

public class DtoSearchDetails
{
    public List<string> make { get; set; }
}

public class DtoSpecifications
{
    public string mmCode { get; set; }
    public int cubicCapacity { get; set; }
    public int kilowatt { get; set; }
    public int newtonMeter { get; set; }
    public int co2Emissions { get; set; }
    public int fuelTypeId { get; set; }
    public double fuelConsumption { get; set; }
    public int period { get; set; }
    public int kmsPerMonth { get; set; }
    public int totalKms { get; set; }
    public int retail { get; set; }
    public string fuelType { get; set; }
}

public class DtoWarranty
{
    public string mmCode { get; set; }
    public int warrantyMonths { get; set; }
    public int warrantyKilometers { get; set; }
    public int planTypeId { get; set; }
    public int planMonths { get; set; }
    public int planKilometers { get; set; }
    public string planType { get; set; }
}

[DapperCrud.Attributes.Table("fleet_assist", Schema = "westvaal")]
public class FleetAssist
{
    [Key] [Column("id")] public int Id { get; set; }
    [Column("name")] public string Name { get; set; }
    [Column("make")] public string Make { get; set; }
    [Column("discount")] public decimal Discount { get; set; }
    [Column("n")] public string N { get; set; }
}