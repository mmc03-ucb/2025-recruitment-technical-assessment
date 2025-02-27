//
//  BuildingLoader.swift
//  FreeroomsAssessment
//
//  Created by Anh Nguyen on 31/1/2025.
//

import Foundation

public class BuildingLoader {
    private var client: HttpClient
    private var url: URL
    
    public enum Error: Swift.Error {
        case connectivity, invalidData
    }
    
    public typealias Result = Swift.Result<[Building], Swift.Error>
    
    public init(client: HttpClient, url: URL) {
        self.client = client
        self.url = url
    }
    
    public func fetchBuildings() async -> Result {
        // Fetch data from the network
        let result = await client.get(from: url)
        
        // Check if the network request failed
        if case .failure = result {
            return .failure(Error.connectivity)
        }
        
        // Extract data and response
        guard case .success(let (data, httpResponse)) = result else {
                return .failure(Error.connectivity) 
            }
            
        // Ensure the response has status code 200
        guard httpResponse.statusCode == 200 else {
            return .failure(Error.invalidData)
        }
        
        // decode the JSON data
        do {
            let remoteBuildings = try JSONDecoder().decode([RemoteBuilding].self, from: data)
            
            // Convert RemoteBuilding objects to Building objects
            var buildings: [Building] = []
            for remoteBuilding in remoteBuildings {
                let building = Building(
                    name: remoteBuilding.building_name,
                    id: remoteBuilding.building_id.uuidString,
                    latitude: remoteBuilding.building_latitude,
                    longitude: remoteBuilding.building_longitude,
                    aliases: remoteBuilding.building_aliases
                )
                buildings.append(building)
            }
            
            // Return the successfully fetched and converted buildings
            return .success(buildings)
            
        } catch {
            // JSON decoding failure
            return .failure(Error.invalidData)
        }
    }
}
